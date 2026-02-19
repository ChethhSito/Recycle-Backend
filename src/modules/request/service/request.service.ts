import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument } from '../schema/requests.schema';
import { User, UserDocument } from 'src/modules/users/schema/users.schema';
import { CreateRequestDto } from '../dto/create-request.dto';

@Injectable()
export class RequestsService {
    constructor(
        @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>, // Asumiendo que tu schema de usuario se llama 'User'
    ) { }

    // 1. Crear una solicitud (Vinculada al usuario logueado)
    async create(userId: string, data: any) {

        const points = Math.round(parseFloat(data.quantity) * 10);

        // Parseamos la ubicación que viene del front (FormData envía strings)
        const rawLocation = typeof data.location === 'string'
            ? JSON.parse(data.location)
            : data.location;

        const newRequest = new this.requestModel({
            citizen: userId,
            category: data.category,
            materialType: data.materialType,
            quantity: parseFloat(data.quantity),
            description: data.description,
            measureType: data.measureType,
            imageUrl: data.imageUrl,
            estimatedPoints: points,
            status: 'PENDING',

            location: {
                type: 'Point',
                coordinates: [rawLocation.longitude, rawLocation.latitude],
                address: rawLocation.address || ''
            }
        });

        return await newRequest.save();
    }

    // 2. Obtener SOLO las solicitudes del usuario logueado
    async findAllMyRequests(userId: string) {
        return await this.requestModel
            .find({
                $or: [
                    { citizen: userId }, // Funciona porque en tu DB citizen es String
                    { collector: new Types.ObjectId(userId) } // 🚨 REQUERIDO: collector es ObjectId
                ]
            })
            .sort({ createdAt: -1 })
            .exec();
    }
    // 3. Obtener UNA solicitud específica (para el detalle)
    async findOneSecure(id: string, userId: string) {
        const request = await this.requestModel.findById(id)
            .populate('citizen', 'fullName phoneNumber') // Útil para que el reciclador llame al ciudadano
            .populate('collector', 'fullName')
            .exec();

        if (!request) throw new NotFoundException(`Solicitud #${id} no encontrada`);

        // Validar que el usuario tenga relación con la solicitud
        const isOwner = request.citizen['_id'].toString() === userId;
        const isAssignedCollector = request.collector?.toString() === userId;

        if (!isOwner && !isAssignedCollector) {
            throw new BadRequestException('No tienes permiso para ver esta solicitud.');
        }

        return request;
    }

    async findNearby(lat: number, lng: number, maxDistanceKm: number = 10) {
        return this.requestModel.find({
            status: 'PENDING', // Solo las que no han sido recogidas
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat] // Tu ubicación [Longitud, Latitud]
                    },
                    $maxDistance: maxDistanceKm * 1000 // Convertir KM a Metros
                }
            }
        })
            .populate('citizen', 'fullName avatarUrl') // Traer datos del usuario si quieres
            .exec();
    }


    async acceptRequest(requestId: string, collectorId: string) {
        // 1. Buscar la solicitud
        const request = await this.requestModel.findById(requestId);

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        // 2. Validar que no esté ya aceptada
        if (request.status !== 'PENDING') {
            throw new BadRequestException('Esta solicitud ya fue aceptada por otro reciclador.');
        }

        // 3. Evitar que el mismo ciudadano acepte su propia solicitud (Opcional)
        if (request.citizen.toString() === collectorId) {
            throw new BadRequestException('No puedes aceptar tu propia solicitud.');
        }
        const alreadyHasTask = await this.requestModel.findOne({
            collector: collectorId,
            status: 'ACCEPTED'
        });
        if (alreadyHasTask) {
            throw new BadRequestException('Ya tienes una solicitud en progreso.');
        }
        // 4. Actualizar estado y asignar recolector
        request.status = 'ACCEPTED';
        request.collector = new Types.ObjectId(collectorId); // Asignar ID

        return await request.save();
    }


    async cancelRequest(requestId: string, userId: string) {
        const request = await this.requestModel.findById(requestId);

        if (!request) throw new NotFoundException('Solicitud no encontrada');

        // SEGURIDAD: Solo el dueño de la solicitud puede cancelarla
        if (request.citizen.toString() !== userId) {
            throw new BadRequestException('No tienes permiso para cancelar esta solicitud.');
        }

        // VALIDACIÓN: No se puede cancelar si un reciclador ya está en camino
        if (request.status !== 'PENDING') {
            throw new BadRequestException('No puedes cancelar una solicitud que ya ha sido aceptada.');
        }

        request.status = 'CANCELED';
        return await request.save();
    }

    async completeRequest(requestId: string, collectorId: string, evidenceUrl: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Solicitud no encontrada');

        // SEGURIDAD: Comparación robusta
        if (request.collector?.toString() !== collectorId.toString()) {
            throw new BadRequestException('No tienes permiso para completar esta solicitud.');
        }

        // VALIDACIÓN DE ESTADO
        if (request.status !== 'ACCEPTED') {
            throw new BadRequestException('La solicitud debe estar aceptada para poder finalizarla.');
        }

        // ACTUALIZACIÓN DE DATOS
        request.status = 'COMPLETED';
        request.completedAt = new Date();

        // Guardamos la foto que el reciclador acaba de tomar
        // Nota: Asegúrate de que 'evidenceUrl' esté en tu Schema
        (request as any).evidenceUrl = evidenceUrl;

        await request.save();

        // ASIGNAR PUNTOS AL CIUDADANO (current_points según tu DB)
        await this.userModel.findByIdAndUpdate(
            request.citizen,
            { $inc: { current_points: request.estimatedPoints } }
        );

        return {
            message: '¡Recojo exitoso! Puntos otorgados.',
            evidence: evidenceUrl,
            points: request.estimatedPoints
        };
    }
}
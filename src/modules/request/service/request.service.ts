import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument } from '../schema/requests.schema';
import { CreateRequestDto } from '../dto/create-request.dto';

@Injectable()
export class RequestsService {
    constructor(
        @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
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

            // 👇 CONVERSIÓN A GEOJSON AQUÍ
            location: {
                type: 'Point',
                // ¡IMPORTANTE! MongoDB usa [LONGITUDE, LATITUDE]
                coordinates: [rawLocation.longitude, rawLocation.latitude],
                address: rawLocation.address || ''
            }
        });

        return await newRequest.save();
    }

    // 2. Obtener SOLO las solicitudes del usuario logueado
    async findAllMyRequests(userId: string) {
        return await this.requestModel
            .find({ citizen: userId }) // Filtramos por el ID del usuario
            .sort({ createdAt: -1 })   // Las más recientes primero
            .exec();
    }

    // 3. Obtener UNA solicitud específica (para el detalle)
    async findOne(id: string) {
        const request = await this.requestModel.findById(id).exec();
        if (!request) throw new NotFoundException(`Solicitud #${id} no encontrada`);
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

        // 4. Actualizar estado y asignar recolector
        request.status = 'ACCEPTED';
        request.collector = new Types.ObjectId(collectorId); // Asignar ID

        return await request.save();
    }
}
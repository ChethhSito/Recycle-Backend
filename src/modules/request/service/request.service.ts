import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument } from '../schema/requests.schema';
import { User, UserDocument } from 'src/modules/users/schema/users.schema';
import { CreateRequestDto } from '../dto/create-request.dto';
import { EcoParticipant, EcoParticipantDocument } from 'src/modules/users/schema/eco-participant.schema';
import { Level, LevelDocument } from 'src/modules/level/schema/levels.schema';

@Injectable()
export class RequestsService {
    constructor(
        @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
        @InjectModel('Level') private levelModel: Model<LevelDocument>,
    ) { }

    // 1. Crear una solicitud
    async create(userId: string, data: any) {
        let points = 0;
        const quantity = parseFloat(data.quantity);

        // Lógica de puntos: Valoramos más el peso por densidad
        if (data.measureType === 'peso') {
            points = Math.round(quantity * 25); // 25 pts por Kg
        } else {
            points = Math.round(quantity * 10); // 10 pts por Unidad/Bolsa
        }

        const rawLocation = typeof data.location === 'string'
            ? JSON.parse(data.location)
            : data.location;

        const newRequest = new this.requestModel({
            citizen: userId,
            category: data.category,
            materialType: data.materialType,
            quantity: quantity,
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

    // ... (findAllMyRequests, findOneSecure, findNearby, acceptRequest, manageRequest, etc. unchanged)

    async findAllMyRequests(userId: string) {
        return await this.requestModel.find({
            $or: [
                { citizen: userId },
                { collector: new Types.ObjectId(userId) },
                { managedBy: new Types.ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 }).exec();
    }

    async findOneSecure(id: string, userId: string) {
        const request = await this.requestModel.findById(id)
            .populate('citizen', 'fullName phoneNumber')
            .populate('collector', 'fullName')
            .exec();
        if (!request) throw new NotFoundException(`Solicitud #${id} no encontrada`);
        const isOwner = request.citizen['_id'].toString() === userId;
        const isAssignedCollector = request.collector?.toString() === userId;
        if (!isOwner && !isAssignedCollector) throw new BadRequestException('No tienes permiso para ver esta solicitud.');
        return request;
    }

    async findNearby(lat: number, lng: number, maxDistanceKm: number = 10) {
        return this.requestModel.find({
            status: 'PENDING',
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: maxDistanceKm * 1000
                }
            }
        }).populate('citizen', 'fullName avatarUrl').exec();
    }

    async acceptRequest(requestId: string, collectorId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Solicitud no encontrada');
        if (request.status !== 'PENDING') throw new BadRequestException('Esta solicitud ya fue aceptada.');
        const alreadyHasTask = await this.requestModel.findOne({ collector: collectorId, status: 'ACCEPTED' });
        if (alreadyHasTask) throw new BadRequestException('Ya tienes una solicitud en progreso.');
        request.status = 'ACCEPTED';
        request.collector = new Types.ObjectId(collectorId);
        await request.save();

        // 🚨 ENVIAR NOTIFICACIÓN AL CIUDADANO
        const citizen = request.citizen as any; // Documento de usuario poblado
        if (citizen.pushToken) {
            await this.sendPushNotification(
                citizen.pushToken,
                "¡Reciclador en camino! ♻️",
                `Tu solicitud de ${request.category} ha sido aceptada.`
            );
        }
        return request;
    }

    private async sendPushNotification(expoPushToken: string, title: string, body: string) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: { someData: 'goes here' },
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
    }

    async manageRequest(requestId: string, officialId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Solicitud no encontrada');
        request.managedBy = new Types.ObjectId(officialId);
        return await request.save();
    }

    async findAllByOfficial(officialId: string) {
        return await this.requestModel.find({ managedBy: new Types.ObjectId(officialId) }).populate('citizen', 'fullName email').exec();
    }

    async findAllPendingPool() {
        return await this.requestModel.find({ managedBy: null, status: 'PENDING' }).populate('citizen', 'fullName email').exec();
    }

    async cancelRequest(requestId: string, userId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Solicitud no encontrada');
        if (request.citizen.toString() !== userId) throw new BadRequestException('No tienes permiso.');
        if (request.status !== 'PENDING') throw new BadRequestException('No puedes cancelar una aceptada.');
        request.status = 'CANCELED';
        return await request.save();
    }

    async completeRequest(requestId: string, collectorId: string, evidenceUrl: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Solicitud no encontrada');
        if (request.collector?.toString() !== collectorId.toString()) throw new BadRequestException('No tienes permiso.');
        if (request.status !== 'ACCEPTED') throw new BadRequestException('La solicitud debe estar aceptada.');

        if (request.collector?.toString() !== collectorId.toString()) {
            throw new BadRequestException('No tienes permiso para completar esta solicitud.');
        }

        if (request.status !== 'ACCEPTED') {
            throw new BadRequestException('La solicitud debe estar aceptada para finalizarla.');
        }
        request.status = 'COMPLETED';
        request.completedAt = new Date();
        (request as any).evidenceUrl = evidenceUrl;
        await request.save();

        // 🏆 ACTUALIZACIÓN DE PUNTOS Y KILOS EN EL PERFIL (NORMALIZADO)
        await this.participantModel.findOneAndUpdate(
            { user: request.citizen },
            {
                $inc: {
                    current_points: request.estimatedPoints,
                    total_recycled_kg: request.quantity
                },
                $set: { lastActivity: new Date() }
            },
            { new: true, upsert: true }
        );

        // --- LÓGICA DE USUARIO Y GAMIFICACIÓN ---
        const user = await this.userModel.findById(request.citizen);
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const newTotalPoints = (user.current_points || 0) + request.estimatedPoints;

        // Buscamos el nivel correspondiente
        const correctLevel = await this.levelModel.findOne({
            minPoints: { $lte: newTotalPoints },
            maxPoints: { $gte: newTotalPoints }
        }).exec();

        const finalLevelId = correctLevel ? correctLevel.levelNumber : 7;

        // --- PREPARAR ACTUALIZACIÓN ATÓMICA ($inc) ---
        const isPeso = request.measureType?.toLowerCase() === 'peso';

        // Mapeo dinámico de categoría (Plástico -> plastic)
        const categoryMap: { [key: string]: string } = {
            'Plástico': 'plastic',
            'Papel': 'paper',
            'Cartón': 'paper',
            'Vidrio': 'glass',
            'Metal': 'metal'
        };
        const categoryKey = categoryMap[request.category] || 'plastic';

        // Definimos qué campos incrementar según la unidad
        const updateData: any = {
            $set: {
                current_points: newTotalPoints,
                level_id: finalLevelId
            },
            $inc: {}
        };

        if (isPeso) {
            updateData.$inc['recyclingStats.total_kg'] = request.quantity;
            updateData.$inc[`recyclingStats.by_category.${categoryKey}.kg`] = request.quantity;
        } else {
            updateData.$inc['recyclingStats.total_units'] = request.quantity;
            updateData.$inc[`recyclingStats.by_category.${categoryKey}.units`] = request.quantity;
        }

        await this.userModel.findByIdAndUpdate(request.citizen, updateData);

        return {
            message: '¡Recojo completado! Impacto y nivel actualizados.',
            pointsAwarded: request.estimatedPoints,
            newLevel: finalLevelId,
            evidence: evidenceUrl,
            recycled: request.quantity
        };
    }
}

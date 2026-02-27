import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument } from '../schema/requests.schema';
import { User, UserDocument } from 'src/modules/users/schema/users.schema';
import { EcoParticipant, EcoParticipantDocument } from 'src/modules/users/schema/eco-participant.schema';

@Injectable()
export class RequestsService {
    constructor(
        @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
    ) { }

    // 1. Crear una solicitud
    async create(userId: string, data: any) {
        const points = Math.round(parseFloat(data.quantity) * 10);
        const rawLocation = typeof data.location === 'string' ? JSON.parse(data.location) : data.location;

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
        return await request.save();
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
            { new: true, upsert: true } // Upsert por si el perfil no existía (aunque debería)
        );

        return {
            message: '¡Recojo exitoso! Puntos y kilos registrados en tu perfil.',
            evidence: evidenceUrl,
            points: request.estimatedPoints,
            recycled: request.quantity
        };
    }
}

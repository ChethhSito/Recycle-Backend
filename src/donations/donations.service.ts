import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Donation, DonationDocument, DonationStatus } from './schema/donation.schema';
import { User, UserDocument } from '../modules/users/schema/users.schema';
import { EcoParticipant, EcoParticipantDocument } from '../modules/users/schema/eco-participant.schema';
import { EmailService } from '../common/email.service';

@Injectable()
export class DonationsService {
    constructor(
        @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
        private emailService: EmailService,
    ) { }

    async createDonation(userId: string, data: any) {
        try {
            console.log(`[Donations] Iniciando creación de aporte para usuario: ${userId}`, data);

            const donation = new this.donationModel({
                user: new Types.ObjectId(userId),
                payerName: data.payerName,
                membershipTier: data.membershipTier,
                amount: data.amount,
                status: DonationStatus.APPROVED,
                isRead: false,
            });

            // 🏆 ACTUALIZACIÓN DE MEMBRESÍA AUTOMÁTICA
            await this.updateUserMembership(userId, data.membershipTier, 'ACTIVE');

            const savedDonation = await donation.save();
            console.log(`[Donations] Aporte guardado con éxito: ${savedDonation._id}`);

            try {
                const user = await this.userModel.findById(userId);
                if (user && user.email) {
                    await this.emailService.sendThankYouEmail(user.email, {
                        payerName: data.payerName,
                        amount: data.amount,
                        membershipTier: data.membershipTier
                    });
                }
            } catch (emailError) {
                console.error(`[Donations] Fallo al enviar el correo a ${userId}:`, emailError);
            }

            return savedDonation;
        } catch (error) {
            console.error('[Donations] Error fatal al crear donación:', error);
            throw error;
        }
    }

    async findAll() {
        return this.donationModel.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'ecoparticipants',
                    localField: 'user',
                    foreignField: 'user',
                    as: 'participantDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    tier: '$membershipTier',
                    status: 1,
                    payerName: 1,
                    transactionId: 1,
                    paymentMethod: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: '$userDetails._id',
                        fullName: '$userDetails.fullName',
                        email: '$userDetails.email',
                        membershipStatus: { $ifNull: [{ $arrayElemAt: ['$participantDetails.membershipStatus', 0] }, 'NONE'] },
                        membershipTier: { $ifNull: [{ $arrayElemAt: ['$participantDetails.membershipTier', 0] }, 'NONE'] }
                    }
                }
            }
        ]).exec();
    }

    async markAsRead(donationId: string) {
        return this.donationModel.findByIdAndUpdate(donationId, { isRead: true }, { new: true });
    }

    async updateStatus(donationId: string, status: DonationStatus) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) return null;

        donation.status = status;
        await donation.save();

        if (status === DonationStatus.APPROVED) {
            await this.updateUserMembership(donation.user.toString(), donation.membershipTier, 'ACTIVE');
        } else {
            await this.updateUserMembership(donation.user.toString(), 'NONE', 'NONE');
        }

        return donation;
    }

    private async updateUserMembership(userId: string, tier: string, status: string) {
        try {
            const finalTier = tier || 'NONE';
            const userObjectId = new Types.ObjectId(userId);

            console.log(`[Donations] Actualizando membresía para ${userId}: ${finalTier}, estado: ${status}`);

            // 🛡️ Limpieza de seguridad: Si existen duplicados (ej: uno como string y otro como ObjectId),
            // borramos el que use el formato antiguo para evitar errores de índice único.
            await this.participantModel.deleteMany({
                user: userId, // Busca como string
            }).exec();

            // Ahora actualizamos o insertamos el registro correcto usando el ObjectId.
            const result = await this.participantModel.findOneAndUpdate(
                { user: userObjectId },
                {
                    membershipTier: finalTier,
                    membershipStatus: status === 'ACTIVE' ? 'ACTIVE' : (status === 'NONE' ? 'NONE' : 'PENDING'),
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            ).exec();

            console.log(`[Donations] Membresía actualizada con éxito para ${userId}`);
            return result;
        } catch (error) {
            console.error(`[Donations] Error crítico en updateUserMembership para ${userId}:`, error);
            // Si el error es por índice duplicado (11000), puede ser por un registro viejo con String ID.
            if (error.code === 11000) {
                console.warn(`[Donations] Conflicto de índice único detectado. Intentando rescate...`);
                // En este caso, el registro ya existe pero quizás con otro formato.
                // Mongoose ya debería haberlo manejado el upsert si el query fuera perfecto.
            }
            throw error; // Re-lanzamos para que createDonation devuelva 500 pero con log.
        }
    }

    // Mantener compatibilidad si se usan estos métodos
    async approveDonation(donationId: string) {
        return this.updateStatus(donationId, DonationStatus.APPROVED);
    }

    async sendThankYouEmailById(donationId: string) {
        const donation = await this.donationModel.findById(donationId).exec();
        if (!donation) throw new NotFoundException('Aporte no encontrado');

        const user = await this.userModel.findById(donation.user).exec();
        if (!user || !user.email) throw new BadRequestException('El usuario no tiene correo registrado');

        await this.emailService.sendThankYouEmail(user.email, {
            payerName: donation.payerName || user.fullName,
            amount: donation.amount,
            membershipTier: donation.membershipTier || 'STARTER'
        });

        return { message: 'Correo enviado con éxito' };
    }

    async rejectDonation(donationId: string) {
        return this.updateStatus(donationId, DonationStatus.REJECTED);
    }

    async deleteDonation(donationId: string) {
        return this.donationModel.findByIdAndDelete(donationId).exec();
    }

    async toggleUserMembership(userId: string) {
        console.log(`[Donations] Toggling membership for user: ${userId}`);
        const userObjectId = new Types.ObjectId(userId);

        const participant = await this.participantModel.findOne({ user: userObjectId }).exec();

        let newStatus: string;
        let newTier: string;

        // Si no está activo, lo activamos
        if (!participant || participant.membershipStatus !== 'ACTIVE') {
            newStatus = 'ACTIVE';
            // Buscamos la última donación aprobada de este usuario para saber qué rango ponerle
            const lastApprovedDonation = await this.donationModel
                .findOne({
                    user: userObjectId,
                    status: DonationStatus.APPROVED
                })
                .sort({ createdAt: -1 })
                .exec();

            newTier = lastApprovedDonation ? (lastApprovedDonation.membershipTier || 'NONE') : 'NONE';
        } else {
            // Si está activo, lo inhabilitamos
            newStatus = 'NONE';
            newTier = 'NONE';
        }

        return this.updateUserMembership(userId, newTier, newStatus);
    }
}

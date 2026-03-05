import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument, ContactStatus } from '../schema/contact.schema';
import { CreateContactDto } from '../dto/create-contact.dto';

@Injectable()
export class ContactService {
    constructor(
        @InjectModel(Contact.name) private contactModel: Model<ContactDocument>
    ) { }

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const newContact = new this.contactModel(createContactDto);
        return await newContact.save();
    }

    async findAll(): Promise<Contact[]> {
        // Auto-cleanup: Buscar en TRASH con más de 10 días y borrarlos
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        await this.contactModel.deleteMany({
            status: ContactStatus.TRASH,
            updatedAt: { $lt: tenDaysAgo }
        }).exec();

        // Devolver todo (para que en el front puedan ver la papelera)
        return await this.contactModel.find().sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Contact> {
        const contact = await this.contactModel.findById(id).exec();
        if (!contact) throw new NotFoundException('Contacto no encontrado');
        return contact;
    }

    async markAsRead(id: string): Promise<Contact> {
        // Toggle: si está en PENDING, lo pasa a READ. Si ya está READ, lo pasa a PENDING
        const contactInfo = await this.contactModel.findById(id).exec();
        if (!contactInfo) throw new NotFoundException('Contacto no encontrado');

        const newStatus = contactInfo.status === ContactStatus.PENDING ? ContactStatus.READ : ContactStatus.PENDING;

        const contact = await this.contactModel.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        ).exec();

        if (!contact) throw new NotFoundException('Contacto no encontrado');
        return contact;
    }

    async delete(id: string): Promise<any> {
        // En lugar de borrar, comprobamos: si ya estaba en papelera, lo borra definitivamente
        const contact = await this.contactModel.findById(id).exec();
        if (!contact) throw new NotFoundException('Contacto no encontrado');

        if (contact.status === ContactStatus.TRASH) {
            await this.contactModel.findByIdAndDelete(id).exec();
            return { message: 'Eliminado definitivamente' };
        } else {
            await this.contactModel.findByIdAndUpdate(id, { status: ContactStatus.TRASH }).exec();
            return { message: 'Movido a la papelera' };
        }
    }
}

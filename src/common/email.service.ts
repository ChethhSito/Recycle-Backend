import { Injectable, Logger } from '@nestjs/common';
const sgMail = require('@sendgrid/mail');

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        } else {
            this.logger.warn('SENDGRID_API_KEY no está definido en las variables de entorno');
        }
    }

    async sendThankYouEmail(to: string, data: { payerName: string; amount: number; membershipTier: string }) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'default@tudominio.com';

        const msg = {
            to,
            from: fromEmail,
            templateId: 'd-0f16f43f04eb49e59713a004ae3e8713',
            dynamicTemplateData: {
                params: {
                    nombre_usuario: data.payerName
                },
                payerName: data.payerName,
                amount: data.amount,
                membershipTier: data.membershipTier
            },
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Email de agradecimiento enviado exitosamente a ${to}`);
        } catch (error: any) {
            this.logger.error('Error enviando email con SendGrid', error);
            if (error.response) {
                this.logger.error(JSON.stringify(error.response.body));
            }
        }
    }
}

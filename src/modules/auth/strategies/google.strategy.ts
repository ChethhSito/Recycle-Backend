import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
            scope: ['email', 'profile'], // Pedimos email y nombre
        });
    }
    // --- AGREGA ESTE BLOQUE MÁGICO ---
    // Esto inyecta el parámetro '?prompt=select_account' en la URL de Google
    authorizationParams(): { [key: string]: string } {
        return {
            prompt: 'select_account',
            access_type: 'offline',
        };
    }
    // ---------------------------------

    // Esta función se ejecuta cuando Google nos responde "OK"
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos, id } = profile;

        // Normalizamos los datos de Google para usarlos en nuestro Servicio
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            googleId: id,
            accessToken,
        };

        done(null, user);
    }
}
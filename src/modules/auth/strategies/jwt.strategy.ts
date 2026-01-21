import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // 1. Busca el token en el Header "Authorization: Bearer ..."
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 2. No dejes pasar tokens vencidos
            ignoreExpiration: false,
            // 3. ¡IMPORTANTE! Usa la misma clave secreta que en auth.module.ts
            secretOrKey: process.env.JWT_SECRET || 'TU_CLAVE_SECRETA_SUPER_SEGURA',
        });
    }

    // 4. Si el token es válido, NestJS ejecuta esto automáticamente
    async validate(payload: any) {
        // Lo que retornes aquí se mete en 'req.user'
        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}
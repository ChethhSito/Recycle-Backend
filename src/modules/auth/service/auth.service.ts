import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service'; // Usamos el servicio que creamos antes
import { UserRole } from '../../users/enum/userRole.enum';
import { User, UserDocument } from 'src/modules/users/schema/users.schema';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
@Injectable()
export class AuthService {
  private transporter;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  private async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, table, td, h1, h2, p, div { font-family: Arial, sans-serif !important; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        
        <div style="max-width: 600px; margin: 20px auto; background-color: #b1eedc; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <div style="background-color: #018f64; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Bienvenido a Recycle! 🌿</h1>
          </div>

          <div style="padding: 40px; text-align: center; color: #31253B; background-color: #ffffff;">
            <h2 style="color: #018f64; margin-top: 0;">¡Hola, ${name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555;">
              Estamos muy felices de que hayas decidido unirte a nuestra comunidad. 
              Has dado el primer paso para hacer del mundo un lugar más limpio y verde.
            </p>

            <div style="background-color: #FAC96E; padding: 20px; border-radius: 10px; margin: 30px 0;">
                <p style="margin: 0; font-weight: bold; font-size: 18px; color: #31253B;">
                    "Pequeñas acciones, grandes cambios."
                </p>
            </div>

            <p style="font-size: 16px; color: #555;">
              Explora la app, recicla, gana puntos y conviértete en una leyenda del cambio.
              <br><br>
              ¡Cuenta con nosotros para lo que necesites!
            </p>
          </div>

          <div style="background-color: #31253B; color: #b1eedc; padding: 15px; text-align: center; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Recycle. Juntos limpiamos el planeta.
          </div>
        </div>

      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: '"Familia Recycle ♻️" <prastillec@gmail.com>',
      to: email,
      subject: '¡Bienvenido! Tu viaje ecológico comienza hoy 🌱',
      html: htmlContent,
    });
  }

  async register(userDto: CreateUserDto) {
    // 1. Validar si el correo ya existe
    const existingUser = await this.usersService.findOneByEmail(userDto.email);

    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    try {
      // 2. Crear usuario
      const newUser = await this.usersService.create({
        ...userDto,
        authProvider: userDto.authProvider || 'local',

        // ✅ CORRECCIÓN: Usamos el rol que viene del front, o CITIZEN por defecto
        role: userDto.role || UserRole.CITIZEN,
      });

      // --- NUEVO: ENVIAR CORREO DE BIENVENIDA ---
      // Lo hacemos sin "await" para que el usuario no tenga que esperar a que se envíe el correo para entrar a la app.
      this.sendWelcomeEmail(newUser.email, newUser.fullName).catch(err => console.error('Error enviando bienvenida:', err));

      // 3. Devolvemos el Token
      return this.generateJwt(newUser);

    } catch (error) {
      // Si el error es nuestro (throw), lo relanzamos. Si no, error genérico.
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async login(loginData: { email: string; password: string }) {
    // 1. Buscar usuario por email
    const user = await this.usersService.findOneByEmail(loginData.email);

    // 2. Validaciones básicas
    if (!user) {
      // Por seguridad, no digas "usuario no existe", di "credenciales inválidas"
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Caso Borde: Usuario de Google intentando entrar con contraseña
    if (!user.password) {
      throw new UnauthorizedException('Esta cuenta se creó con Google. Por favor inicia sesión con Google.');
    }

    // 4. Verificar Contraseña (bcrypt)
    const isMatch = await bcrypt.compare(loginData.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 5. Todo OK -> Generar Token
    return this.generateJwt(user);
  }

  // 1. Lógica para Google: Buscar o Crear
  async validateGoogleUser(googleUser: any) {
    // A. Buscamos si ya existe por email
    const user = await this.usersService.findOneByEmail(googleUser.email);

    if (user) {
      // Si existe, retornamos el usuario (Aquí podrías actualizar el googleId si falta)
      return user;
    }
    // B. Si NO existe, lo creamos
    console.log('Usuario nuevo de Google detectado. Creando...');

    try {
      const newUser = await this.usersService.create({
        email: googleUser.email,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`,
        googleId: googleUser.googleId,
        avatarUrl: googleUser.picture,
        authProvider: 'google',
        role: UserRole.CITIZEN, // Por defecto es ciudadano
        // password, dni y phone se quedan vacíos
      });
      return newUser;
    } catch (error) {
      // Manejo de errores (ej: si falla la BD)
      throw new InternalServerErrorException('Error creando usuario de Google');
    }
  }

  // 2. Generar el Token JWT (El "Carnet" de acceso)
  async generateJwt(user: UserDocument) {
    const payload = {
      sub: user._id, // ID del usuario en Mongo
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        uid: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
        googleId: user.googleId,
        phone: user.phone,
        dni: user.documentNumber,
        level: user.level_id,
        points: user.current_points,
      }
    };
  }


  async forgotPassword(email: string) {
    const user: UserDocument | null = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // Generar un código aleatorio de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);


    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: code,
      resetPasswordExpires: expires
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inclusive+Sans:wght@400;700&display=swap" rel="stylesheet">

        <style>
          /* 2. FORZAMOS LA FUENTE EN TODOS LOS ELEMENTOS */
          body, table, td, h1, h2, p, div {
            font-family: 'Inclusive Sans', Arial, sans-serif !important;
          }

          .code-box {
            background-color: #FAC96E; /* Amarillo del diseño */
            border: 2px solid #000000;
            border-radius: 12px;
            width: 60px;
            height: 60px;
            font-size: 28px;
            font-weight: bold;
            color: #31253B;
            text-align: center;
            vertical-align: middle;
            display: inline-block;
            line-height: 60px;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        
        <div style="max-width: 600px; margin: 20px auto; background-color: #b1eedc; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <div style="background-color: #018f64; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Recycle</h1>
          </div>

          <div style="padding: 30px; text-align: center; color: #31253B;">
            <h2 style="margin-top: 0;">Recuperación de Cuenta</h2>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Hola <strong>${user.fullName}</strong>,<br>
              Usa el siguiente código para restablecer tu contraseña.
            </p>

            <table align="center" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="code-box">${code[0]}</td>
                <td width="10"></td>
                <td class="code-box">${code[1]}</td>
                <td width="10"></td>
                <td class="code-box">${code[2]}</td>
                <td width="10"></td>
                <td class="code-box">${code[3]}</td>
              </tr>
            </table>

            <div style="margin-top: 30px; padding: 10px; background-color: rgba(255,255,255,0.5); border-radius: 8px; display: inline-block;">
              <p style="margin: 0; font-size: 14px; font-weight: bold; color: #d9534f;">
                 Expira en 10 minutos
              </p>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #555;">
              Si no solicitaste este cambio, puedes ignorar este correo.
            </p>
          </div>

          <div style="background-color: #31253B; color: #b1eedc; padding: 15px; text-align: center; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Recycle. Juntos limpiamos el planeta.
          </div>
        </div>

      </body>
      </html>
    `;

    // Enviar el correo
    await this.transporter.sendMail({
      from: '"Soporte Recycle" <prastillec@gmail.com>',
      to: email,
      subject: '🔐 Tu código de recuperación Recycle',
      text: `Tu código es: ${code}`, // Texto plano por si el HTML falla
      html: htmlContent,           // Nuestro diseño bonito
    });

    return { message: 'Correo enviado' };

  }
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 1. Validar Código y Tiempo
    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== code
    ) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // 2. Encriptar nueva contraseña (IMPORTANTE)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Guardar y limpiar el código usado
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async checkAuthStatus(userPayload: any) {
    // 1. Buscamos al usuario
    const dbUser = await this.usersService.findOne(userPayload.sub || userPayload._id);

    if (!dbUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 2. Retornamos el token y el usuario actualizado
    return {
      access_token: this.jwtService.sign({
        sub: dbUser._id,
        email: dbUser.email,
        role: dbUser.role
      }),
      user: {
        uid: dbUser._id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
        avatar: dbUser.avatarUrl,

        // 👇 CORRECCIÓN AQUÍ: Usamos los nombres reales de tu Schema
        level: dbUser.level_id,           // Antes decía dbUser.level
        points: dbUser.current_points,    // Antes decía dbUser.points
      }
    };
  }
}
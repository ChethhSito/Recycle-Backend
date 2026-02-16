import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Query,
    Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestsService } from '../service/request.service';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer'; // Para guardar imágenes localmente (o usa S3/Cloudinary)
import { extname } from 'path';
import { CloudinaryService } from 'src/common/cloudinary.service';

@Controller('requests')
@UseGuards(AuthGuard('jwt')) //Todo este controlador requiere Token
export class RequestsController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly requestsService: RequestsService) { }


    @Get('nearby')
    findNearby(
        @Query('lat') lat: number,
        @Query('lng') lng: number,
        @Query('km') km: number = 10
    ) {
        // NestJS recibe los query params como strings, asegúrate de convertirlos
        return this.requestsService.findNearby(Number(lat), Number(lng), Number(km));
    }

    // POST /requests -> Crear solicitud
    @Post()
    @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo en el FormData del front
    async create(@Req() req, @Body() body: any, @UploadedFile() file: Express.Multer.File) {

        console.log("Usuario detectado en Request:", req.user);
        if (!file) throw new BadRequestException('La evidencia (foto) es obligatoria');

        // 1. Subir a Cloudinary
        const imageResult = await this.cloudinaryService.uploadFile(file);
        const userId = req.user?.userId || req.user?.id || req.user?._id || req.user?.sub;
        if (!userId) {
            throw new BadRequestException('No se pudo identificar al usuario (Token inválido)');
        }

        // 2. Crear solicitud con la URL y los datos del body
        // Nota: 'body' llega como strings en multipart, hay que parsear números si es necesario
        return this.requestsService.create(userId, {
            ...body,
            imageUrl: imageResult.secure_url
        });
    }

    // GET /requests/mine -> Ver mis solicitudes
    @Get('mine')
    findAllMine(@Req() req) {
        // 👇 1. AGREGAMOS LOG PARA VER QUIÉN PIDE LA LISTA
        console.log("Usuario solicitando historial:", req.user);

        // 👇 2. USAMOS LA MISMA LÓGICA ROBUSTA QUE EN EL CREATE
        const userId = req.user?.userId || req.user?.id || req.user?._id || req.user?.sub;

        if (!userId) {
            // Si no hay ID, retornamos array vacío o lanzamos error
            console.log("Error: No se encontró User ID en el token");
            return [];
        }

        return this.requestsService.findAllMyRequests(userId);
    }

    // GET /requests/:id -> Ver detalle de una
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requestsService.findOne(id);
    }

    // POST /requests/upload -> Subir Imagen
    // Nota: Esto guarda la imagen en una carpeta 'uploads' local. 
    // Para producción, idealmente usarías Cloudinary o AWS S3.
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads', // Carpeta donde se guardan
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // Devolvemos la URL (suponiendo que sirves la carpeta uploads como estática)
        // Ojo: Cambia localhost por tu IP si pruebas en celular físico
        return {
            url: `http://192.168.18.8:3000/uploads/${file.filename}`
        };
    }

    @Patch(':id/accept')
    async acceptRequest(
        @Param('id') id: string,
        @Req() req
    ) {
        // Asumimos que req.user tiene el ID del usuario logueado (gracias al Guard)
        const collectorId = req.user.userId; // O req.user._id según tu estrategia JWT
        return this.requestsService.acceptRequest(id, collectorId);
    }
}
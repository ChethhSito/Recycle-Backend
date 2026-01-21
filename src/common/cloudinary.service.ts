import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {

    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'eco-recicla_avatars',
                },
                (error, result) => {
                    // 1. Si hay error, rechazamos
                    if (error) return reject(error);

                    // 2. CORRECCIÓN: Si no hay resultado (es undefined), rechazamos manualmente
                    if (!result) {
                        return reject(new Error('Error al subir imagen a Cloudinary: No se recibió respuesta.'));
                    }

                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
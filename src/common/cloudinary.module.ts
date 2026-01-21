import { Module, Global } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Global() // Si tienes esto, debería funcionar en todos lados, pero asegúrate de tener los exports
@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService, CloudinaryProvider], // 👈 ¡ESTA LÍNEA ES OBLIGATORIA!
})
export class CloudinaryModule { }
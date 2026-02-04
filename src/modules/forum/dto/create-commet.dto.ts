import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ example: '65abc123...', description: 'ID del post al que pertenece el comentario' })
    @IsMongoId() // Valida que sea un ID de MongoDB válido
    postId: string;

    @ApiProperty({ example: '¡Excelente iniciativa!', description: 'Texto del comentario' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
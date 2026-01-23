import { PartialType } from '@nestjs/swagger'; // O '@nestjs/mapped-types' si no usas Swagger
import { CreateProgramDto } from './create-program.dto';

export class UpdateProgramDto extends PartialType(CreateProgramDto) { }
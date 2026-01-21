
import { PartialType } from '@nestjs/swagger';
import { CreateInductionDto } from './create-induction.dto';

export class UpdateInductionDto extends PartialType(CreateInductionDto) { }

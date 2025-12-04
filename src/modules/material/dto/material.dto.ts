import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMaterialDto {
    @ApiProperty({ example: 'Plastic Bottle', description: 'Name of the material' })
    name: string;

    @ApiProperty({ example: 'unit', description: 'Unit of measurement (e.g., kg, unit)' })
    unit: string;

    @ApiProperty({ example: 10, description: 'Points per unit when donated' })
    pointsPerUnitDonated: number;

    @ApiProperty({ example: 5, description: 'Points per unit when sold' })
    pointsPerUnitSold: number;

    @ApiProperty({ example: 0.5, description: 'CO2 factor per unit' })
    co2FactorPerUnit: number;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) { }

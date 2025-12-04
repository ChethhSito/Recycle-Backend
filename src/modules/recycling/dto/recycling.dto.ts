import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateRecyclingDto {
    @ApiProperty({ example: '60d5ecb8b487343568912345', description: 'Citizen ID' })
    citizenId: string;

    @ApiProperty({ example: '60d5ecb8b487343568912345', description: 'Recycler ID', required: false })
    recyclerId?: string;

    @ApiProperty({ example: '60d5ecb8b487343568912345', description: 'Material ID' })
    materialId: string;

    @ApiProperty({ example: 10.5, description: 'Quantity reported by citizen' })
    quantity: number;

    @ApiProperty({ example: 10.0, description: 'Confirmed quantity', required: false })
    confirmedQuantity?: number;

    @ApiProperty({ example: 100, description: 'Points earned', required: false })
    pointsEarned?: number;

    @ApiProperty({ example: 5.2, description: 'CO2 saved', required: false })
    co2Saved?: number;

    @ApiProperty({ example: 'http://example.com/image.jpg', description: 'Evidence URL', required: false })
    evidenceUrl?: string;
}

export class UpdateRecyclingDto extends PartialType(CreateRecyclingDto) { }
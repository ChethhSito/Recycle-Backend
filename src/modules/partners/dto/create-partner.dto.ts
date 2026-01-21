import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
    @ApiProperty({ description: 'Name of the partner', example: 'Nos Planét' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Filter category', example: 'corporate', enum: ['financial', 'government', 'ong', 'corporate', 'all'] })
    @IsString()
    @IsIn(['financial', 'government', 'ong', 'corporate', 'all'])
    filterType: string;

    @ApiProperty({ description: 'Visible label for type', example: 'Plataforma' })
    @IsString()
    typeLabel: string;

    @ApiProperty({ description: 'Logo URL', example: 'https://example.com/logo.png' })
    @IsString()
    @IsUrl()
    logo: string;

    @ApiProperty({ description: 'Main Brand Color (Hex)', example: '#002C77' })
    @IsString()
    mainColor: string;

    @ApiProperty({ description: 'Short description', example: 'Beneficios exclusivos...' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Environmental commitment text', example: 'Nuestra misión es...' })
    @IsString()
    environmentalCommitment: string;

    @ApiProperty({ description: 'Number of rewards available', example: 5 })
    @IsNumber()
    rewardsCount: number;

    @ApiProperty({ description: 'Number of users involved', example: 1200 })
    @IsNumber()
    usersCount: number;

    @ApiProperty({ description: 'Show at top of list', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;
}

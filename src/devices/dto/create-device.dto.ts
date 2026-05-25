import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNotEmpty, IsBoolean, IsIP } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Router-1', description: 'Nombre único del dispositivo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'router',
    enum: ['router', 'switch', 'firewall', 'server', 'access-point', 'other'],
  })
  @IsEnum(['router', 'switch', 'firewall', 'server', 'access-point', 'other'])
  type: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Edificio A - Piso 2' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Cisco ISR 4321' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Router principal del edificio A' })
  @IsOptional()
  @IsString()
  description?: string;
}

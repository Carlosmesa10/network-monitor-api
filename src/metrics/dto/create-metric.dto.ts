import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsIP,
} from 'class-validator';

export class CreateMetricDto {
  @ApiProperty({
    example: 'Router-1',
    description: 'Nombre identificador del dispositivo de red',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del dispositivo es requerido' })
  device: string;

  @ApiProperty({
    example: 15,
    description: 'Latencia de red en milisegundos (ms)',
    minimum: 0,
  })
  @IsNumber({}, { message: 'La latencia debe ser un número' })
  @Min(0, { message: 'La latencia no puede ser negativa' })
  latency: number;

  @ApiProperty({
    example: 2,
    description: 'Porcentaje de pérdida de paquetes (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'La pérdida de paquetes debe ser un número' })
  @Min(0, { message: 'El valor mínimo es 0%' })
  @Max(100, { message: 'El valor máximo es 100%' })
  packetLoss: number;

  @ApiProperty({
    example: 120,
    description: 'Ancho de banda utilizado en Mbps',
    minimum: 0,
  })
  @IsNumber({}, { message: 'El ancho de banda debe ser un número' })
  @Min(0, { message: 'El ancho de banda no puede ser negativo' })
  bandwidth: number;

  @ApiProperty({
    example: 'online',
    enum: ['online', 'offline', 'warning', 'critical'],
    description: 'Estado del dispositivo',
  })
  @IsEnum(['online', 'offline', 'warning', 'critical'], {
    message: 'El estado debe ser: online, offline, warning o critical',
  })
  status: string;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'Dirección IP del dispositivo',
  })
  @IsOptional()
  @IsIP(undefined, { message: 'Debe ser una dirección IP válida' })
  ipAddress?: string;

  @ApiPropertyOptional({
    example: 'Edificio A - Piso 2',
    description: 'Ubicación física del dispositivo',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

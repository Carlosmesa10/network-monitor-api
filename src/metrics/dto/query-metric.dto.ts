import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMetricDto {
  @ApiPropertyOptional({ example: 'Router-1', description: 'Filtrar por nombre de dispositivo' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({
    example: 'online',
    enum: ['online', 'offline', 'warning', 'critical'],
    description: 'Filtrar por estado',
  })
  @IsOptional()
  @IsEnum(['online', 'offline', 'warning', 'critical'])
  status?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Fecha de inicio (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Fecha de fin (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 1, description: 'Número de página', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, description: 'Resultados por página', minimum: 1, maximum: 200, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

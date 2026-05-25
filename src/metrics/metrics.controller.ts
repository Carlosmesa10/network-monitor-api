import {
  Controller, Get, Post, Body, Param, Query, Delete,
  HttpCode, HttpStatus, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricDto } from './dto/query-metric.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // POST /api/v1/metrics — Script Python envía métricas aquí
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nueva métrica de red' })
  @ApiResponse({ status: 201, description: 'Métrica guardada en memoria' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createMetricDto: CreateMetricDto) {
    return this.metricsService.create(createMetricDto);
  }

  // GET /api/v1/metrics — Todas las métricas con filtros
  @Get()
  @ApiOperation({ summary: 'Obtener todas las métricas (con filtros y paginación)' })
  findAll(@Query() query: QueryMetricDto) {
    return this.metricsService.findAll(query);
  }

  // GET /api/v1/metrics/summary — Resumen para tarjetas del dashboard
  @Get('summary')
  @ApiOperation({ summary: 'Resumen estadístico del sistema' })
  getSummary() {
    return this.metricsService.getSummary();
  }

  // GET /api/v1/metrics/latest — Última métrica de cada dispositivo
  @Get('latest')
  @ApiOperation({ summary: 'Última métrica de cada dispositivo' })
  getLatestPerDevice() {
    return this.metricsService.getLatestPerDevice();
  }

  // GET /api/v1/metrics/:device/timeseries — Serie temporal para gráficas
  @Get(':device/timeseries')
  @ApiOperation({ summary: 'Serie temporal de un dispositivo para gráficas' })
  @ApiParam({ name: 'device', example: 'Router-1' })
  @ApiQuery({ name: 'hours', required: false, example: 24 })
  getTimeSeries(
    @Param('device') device: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.metricsService.getTimeSeries(device, hours);
  }

  // GET /api/v1/metrics/:device — Historial de un dispositivo
  @Get(':device')
  @ApiOperation({ summary: 'Métricas de un dispositivo específico' })
  @ApiParam({ name: 'device', example: 'Router-1' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  findByDevice(
    @Param('device') device: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.metricsService.findByDevice(device, limit);
  }

  // DELETE /api/v1/metrics/cleanup — Limpiar métricas antiguas de memoria
  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar métricas antiguas de la memoria' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  cleanup(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.metricsService.deleteOldMetrics(days);
  }
}

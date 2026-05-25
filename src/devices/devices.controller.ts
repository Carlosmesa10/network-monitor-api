import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // POST /api/v1/devices
  // Registrar un nuevo dispositivo en el sistema
  // ────────────────────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar dispositivo de red' })
  @ApiResponse({ status: 201, description: 'Dispositivo registrado' })
  @ApiResponse({ status: 409, description: 'El dispositivo ya existe' })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET /api/v1/devices
  // Listar todos los dispositivos registrados
  // ────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar todos los dispositivos' })
  findAll() {
    return this.devicesService.findAll();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET /api/v1/devices/status
  // Estado en tiempo real de TODOS los dispositivos (para el dashboard principal)
  // ────────────────────────────────────────────────────────────────────────────
  @Get('status')
  @ApiOperation({
    summary: 'Estado en tiempo real de todos los dispositivos',
    description:
      'Endpoint principal del dashboard. Retorna el último estado conocido de cada dispositivo ' +
      'con métricas, resumen y timestamp.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        totalDevices: 5,
        summary: { online: 3, offline: 1, warning: 1, critical: 0 },
        devices: [
          {
            device: 'Router-1',
            status: 'online',
            latency: 15,
            packetLoss: 2,
            bandwidth: 120,
            lastSeen: '2024-01-15T10:30:00.000Z',
            ipAddress: '192.168.1.1',
          },
        ],
        updatedAt: '2024-01-15T10:35:00.000Z',
      },
    },
  })
  getStatus() {
    return this.devicesService.getStatus();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET /api/v1/devices/:name/status
  // Estado de un dispositivo específico
  // ────────────────────────────────────────────────────────────────────────────
  @Get(':name/status')
  @ApiOperation({ summary: 'Estado de un dispositivo específico' })
  @ApiParam({ name: 'name', example: 'Router-1' })
  getDeviceStatus(@Param('name') name: string) {
    return this.devicesService.getDeviceStatus(name);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PUT /api/v1/devices/:name
  // Actualizar información de un dispositivo
  // ────────────────────────────────────────────────────────────────────────────
  @Put(':name')
  @ApiOperation({ summary: 'Actualizar dispositivo' })
  @ApiParam({ name: 'name', example: 'Router-1' })
  update(@Param('name') name: string, @Body() updateData: Partial<CreateDeviceDto>) {
    return this.devicesService.update(name, updateData);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE /api/v1/devices/:name
  // Eliminar dispositivo del sistema
  // ────────────────────────────────────────────────────────────────────────────
  @Delete(':name')
  @ApiOperation({ summary: 'Eliminar dispositivo' })
  @ApiParam({ name: 'name', example: 'Router-1' })
  remove(@Param('name') name: string) {
    return this.devicesService.remove(name);
  }
}

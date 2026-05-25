import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';
import { CreateDeviceDto } from './dto/create-device.dto';

export interface Device {
  id: string;
  name: string;
  type: string;
  ipAddress?: string;
  location?: string;
  model?: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  // ─── ALMACENAMIENTO EN MEMORIA ───────────────────────────────────────────────
  private devices: Device[] = [];
  private idCounter = 1;

  constructor(private readonly metricsService: MetricsService) {}

  // ─── REGISTRAR DISPOSITIVO ───────────────────────────────────────────────────
  create(dto: CreateDeviceDto): Device {
    const existing = this.devices.find(
      d => d.name.toLowerCase() === dto.name.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException(`Ya existe un dispositivo con el nombre: ${dto.name}`);
    }
    const device: Device = {
      id: String(this.idCounter++),
      isActive: true,
      ...dto,
      createdAt: new Date(),
    };
    this.devices.push(device);
    this.logger.log(`Dispositivo registrado: ${dto.name}`);
    return device;
  }

  // ─── LISTAR TODOS LOS DISPOSITIVOS ──────────────────────────────────────────
  findAll(): Device[] {
    return [...this.devices].sort((a, b) => a.name.localeCompare(b.name));
  }

  // ─── ESTADO EN TIEMPO REAL DE TODOS LOS DISPOSITIVOS ────────────────────────
  getStatus() {
    const latest = this.metricsService.getLatestPerDevice();

    const summary = { online: 0, offline: 0, warning: 0, critical: 0 };
    for (const m of latest) {
      if (m.status in summary) summary[m.status]++;
    }

    const devices = latest.map(m => ({
      device: m.device,
      status: m.status,
      latency: m.latency,
      packetLoss: m.packetLoss,
      bandwidth: m.bandwidth,
      lastSeen: m.createdAt,
      ipAddress: m.ipAddress,
    }));

    return {
      totalDevices: devices.length,
      summary,
      devices,
      updatedAt: new Date().toISOString(),
    };
  }

  // ─── ESTADO DE UN DISPOSITIVO ESPECÍFICO ────────────────────────────────────
  getDeviceStatus(deviceName: string) {
    const all = this.metricsService.findByDevice(deviceName, 1);
    const latest = all.data[0];

    const minutesAgo = Math.round(
      (Date.now() - new Date(latest.createdAt).getTime()) / 60000,
    );

    return {
      device: deviceName,
      currentStatus: latest.status,
      lastReport: {
        latency: latest.latency,
        packetLoss: latest.packetLoss,
        bandwidth: latest.bandwidth,
        timestamp: latest.createdAt,
        minutesAgo,
      },
      isStale: minutesAgo > 5,
    };
  }

  // ─── ACTUALIZAR DISPOSITIVO ──────────────────────────────────────────────────
  update(name: string, updateData: Partial<CreateDeviceDto>): Device {
    const index = this.devices.findIndex(
      d => d.name.toLowerCase() === name.toLowerCase(),
    );
    if (index === -1) {
      throw new NotFoundException(`Dispositivo no encontrado: ${name}`);
    }
    this.devices[index] = { ...this.devices[index], ...updateData };
    return this.devices[index];
  }

  // ─── ELIMINAR DISPOSITIVO ────────────────────────────────────────────────────
  remove(name: string): { message: string } {
    const index = this.devices.findIndex(
      d => d.name.toLowerCase() === name.toLowerCase(),
    );
    if (index === -1) {
      throw new NotFoundException(`Dispositivo no encontrado: ${name}`);
    }
    this.devices.splice(index, 1);
    return { message: `Dispositivo ${name} eliminado correctamente` };
  }
}

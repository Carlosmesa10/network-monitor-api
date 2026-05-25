import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricDto } from './dto/query-metric.dto';

export interface Metric {
  id: string;
  device: string;
  latency: number;
  packetLoss: number;
  bandwidth: number;
  status: string;
  ipAddress?: string;
  location?: string;
  createdAt: Date;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // ─── ALMACENAMIENTO EN MEMORIA ───────────────────────────────────────────────
  private metrics: Metric[] = [];
  private idCounter = 1;

  // ─── CREAR MÉTRICA ───────────────────────────────────────────────────────────
  create(dto: CreateMetricDto): Metric {
    this.logger.log(`Nueva métrica recibida de: ${dto.device}`);
    const metric: Metric = {
      id: String(this.idCounter++),
      ...dto,
      createdAt: new Date(),
    };
    this.metrics.push(metric);
    return metric;
  }

  // ─── OBTENER TODAS LAS MÉTRICAS (con filtros y paginación) ──────────────────
  findAll(query: QueryMetricDto) {
    const { device, status, from, to, page = 1, limit = 50 } = query;

    let filtered = [...this.metrics];

    if (device) {
      filtered = filtered.filter(m =>
        m.device.toLowerCase().includes(device.toLowerCase()),
      );
    }
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    if (from) {
      filtered = filtered.filter(m => m.createdAt >= new Date(from));
    }
    if (to) {
      filtered = filtered.filter(m => m.createdAt <= new Date(to));
    }

    // Ordenar más reciente primero
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ─── OBTENER MÉTRICAS DE UN DISPOSITIVO ESPECÍFICO ──────────────────────────
  findByDevice(deviceName: string, limit: number = 100) {
    const metrics = this.metrics
      .filter(m => m.device.toLowerCase().includes(deviceName.toLowerCase()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    if (!metrics.length) {
      throw new NotFoundException(
        `No se encontraron métricas para el dispositivo: ${deviceName}`,
      );
    }

    return {
      device: deviceName,
      count: metrics.length,
      stats: this.calculateStats(metrics),
      data: metrics,
    };
  }

  // ─── ÚLTIMA MÉTRICA DE CADA DISPOSITIVO ─────────────────────────────────────
  getLatestPerDevice(): Metric[] {
    const latestMap = new Map<string, Metric>();

    for (const metric of this.metrics) {
      const existing = latestMap.get(metric.device);
      if (!existing || metric.createdAt > existing.createdAt) {
        latestMap.set(metric.device, metric);
      }
    }

    return Array.from(latestMap.values()).sort((a, b) =>
      a.device.localeCompare(b.device),
    );
  }

  // ─── RESUMEN ESTADÍSTICO ─────────────────────────────────────────────────────
  getSummary() {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = this.metrics.filter(m => m.createdAt >= since24h);

    const devices = new Set(this.metrics.map(m => m.device));
    const statusSummary = { online: 0, offline: 0, warning: 0, critical: 0 };

    // Contar por estado usando la última métrica de cada dispositivo
    for (const m of this.getLatestPerDevice()) {
      if (m.status in statusSummary) statusSummary[m.status]++;
    }

    const avg = (arr: number[]) =>
      arr.length
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100
        : 0;

    return {
      totalMetrics: this.metrics.length,
      totalDevices: devices.size,
      statusSummary,
      last24h: {
        avgLatency: avg(recent.map(m => m.latency)),
        avgPacketLoss: avg(recent.map(m => m.packetLoss)),
        avgBandwidth: avg(recent.map(m => m.bandwidth)),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // ─── SERIE TEMPORAL PARA GRÁFICAS ───────────────────────────────────────────
  getTimeSeries(device: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const series = this.metrics
      .filter(
        m =>
          m.device.toLowerCase().includes(device.toLowerCase()) &&
          m.createdAt >= since,
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(({ latency, packetLoss, bandwidth, status, createdAt }) => ({
        latency, packetLoss, bandwidth, status, createdAt,
      }));

    return { device, hours, points: series.length, series };
  }

  // ─── LIMPIAR MÉTRICAS ANTIGUAS ───────────────────────────────────────────────
  deleteOldMetrics(days: number = 30): { deleted: number } {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const before = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.createdAt >= cutoff);
    const deleted = before - this.metrics.length;
    this.logger.warn(`Eliminadas ${deleted} métricas con más de ${days} días`);
    return { deleted };
  }

  // ─── HELPER ──────────────────────────────────────────────────────────────────
  private calculateStats(metrics: Metric[]) {
    const avg = (arr: number[]) =>
      Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;

    return {
      latency: {
        avg: avg(metrics.map(m => m.latency)),
        min: Math.min(...metrics.map(m => m.latency)),
        max: Math.max(...metrics.map(m => m.latency)),
      },
      packetLoss: {
        avg: avg(metrics.map(m => m.packetLoss)),
        min: Math.min(...metrics.map(m => m.packetLoss)),
        max: Math.max(...metrics.map(m => m.packetLoss)),
      },
      bandwidth: {
        avg: avg(metrics.map(m => m.bandwidth)),
        min: Math.min(...metrics.map(m => m.bandwidth)),
        max: Math.max(...metrics.map(m => m.bandwidth)),
      },
    };
  }
}

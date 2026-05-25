import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';

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

  private devices: Device[] = [
    {
     id: '1',
    name: 'Router',
    type: 'Router',
    ipAddress: '192.168.1.1',
    location: 'Core Network',
    model: 'Cisco 2811',
    isActive: true,
    description: 'Router principal de la red',
    createdAt: new Date(),
  },

  {
    id: '2',
    name: 'Switch-Utica',
    type: 'Core Switch',
    ipAddress: '192.168.1.2',
    location: 'Data Center',
    model: 'Cisco 3560-24PS',
    isActive: true,
    description: 'Switch central de distribución',
    createdAt: new Date(),
  },

  {
    id: '3',
    name: 'Sw-Admin',
    type: 'Access Switch',
    ipAddress: '192.168.1.10',
    location: 'Administración',
    model: 'Cisco 2960-24TT',
    isActive: true,
    description: 'Switch del área administrativa',
    createdAt: new Date(),
  },

  {
    id: '4',
    name: 'Sw-TI',
    type: 'Access Switch',
    ipAddress: '192.168.1.20',
    location: 'Departamento TI',
    model: 'Cisco 2960-24TT',
    isActive: true,
    description: 'Switch del departamento TI',
    createdAt: new Date(),
  },

  {
    id: '5',
    name: 'Sw-Servers',
    type: 'Server Switch',
    ipAddress: '192.168.1.30',
    location: 'Sala de Servidores',
    model: 'Cisco 2960-24TT',
    isActive: true,
    description: 'Switch de servidores',
    createdAt: new Date(),
  },

  {
    id: '6',
    name: 'PC-Admin1',
    type: 'Workstation',
    ipAddress: '192.168.1.101',
    location: 'Administración',
    model: 'Desktop-PC',
    isActive: true,
    description: 'Equipo administrativo 1',
    createdAt: new Date(),
  },

  {
    id: '7',
    name: 'PC-Admin2',
    type: 'Workstation',
    ipAddress: '192.168.1.102',
    location: 'Administración',
    model: 'Desktop-PC',
    isActive: true,
    description: 'Equipo administrativo 2',
    createdAt: new Date(),
  },

  {
    id: '8',
    name: 'PC-TI1',
    type: 'Workstation',
    ipAddress: '192.168.1.201',
    location: 'Departamento TI',
    model: 'Desktop-PC',
    isActive: true,
    description: 'Equipo TI 1',
    createdAt: new Date(),
  },

  {
    id: '9',
    name: 'PC-TI2',
    type: 'Workstation',
    ipAddress: '192.168.1.202',
    location: 'Departamento TI',
    model: 'Desktop-PC',
    isActive: true,
    description: 'Equipo TI 2',
    createdAt: new Date(),
  },

  {
    id: '10',
    name: 'Server-Monitoreo',
    type: 'Monitoring Server',
    ipAddress: '192.168.1.250',
    location: 'Data Center',
    model: 'Dell PowerEdge',
    isActive: true,
    description: 'Servidor principal de monitoreo',
    createdAt: new Date(),
  },
];

  private idCounter = 6;

  create(dto: CreateDeviceDto): Device {
    const existing = this.devices.find(
      d => d.name.toLowerCase() === dto.name.toLowerCase(),
    );

    if (existing) {
      throw new ConflictException(
        `Ya existe un dispositivo con el nombre ${dto.name}`,
      );
    }

    const device: Device = {
      id: String(this.idCounter++),
      isActive: true,
      ...dto,
      createdAt: new Date(),
    };

    this.devices.push(device);

    return device;
  }

  findAll(): Device[] {
    return this.devices;
  }

  getStatus() {
    const devices = this.devices.map(device => {
      const latency = Math.floor(Math.random() * 100);
      const packetLoss = Math.floor(Math.random() * 10);
      const bandwidth = Math.floor(Math.random() * 900) + 100;

      let status = 'online';

      if (latency > 70) {
        status = 'critical';
      } else if (latency > 30) {
        status = 'warning';
      }

      return {
        device: device.name,
        type: device.type,
        status,
        latency,
        packetLoss,
        bandwidth,
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        uptime: (95 + Math.random() * 5).toFixed(2),
        lastSeen: new Date(),
        ipAddress: device.ipAddress,
        location: device.location,
        model: device.model,
      };
    });

    return {
      totalDevices: devices.length,

      summary: {
        online: devices.filter(d => d.status === 'online').length,
        offline: 0,
        warning: devices.filter(d => d.status === 'warning').length,
        critical: devices.filter(d => d.status === 'critical').length,
      },

      devices,

      updatedAt: new Date().toISOString(),
    };
  }

  getDeviceStatus(deviceName: string) {
    const device = this.getStatus().devices.find(
      d => d.device.toLowerCase() === deviceName.toLowerCase(),
    );

    if (!device) {
      throw new NotFoundException(
        `Dispositivo no encontrado`,
      );
    }

    return device;
  }

  update(
    name: string,
    updateData: Partial<CreateDeviceDto>,
  ): Device {
    const index = this.devices.findIndex(
      d => d.name.toLowerCase() === name.toLowerCase(),
    );

    if (index === -1) {
      throw new NotFoundException(
        `Dispositivo no encontrado`,
      );
    }

    this.devices[index] = {
      ...this.devices[index],
      ...updateData,
    };

    return this.devices[index];
  }

  remove(name: string) {
    const index = this.devices.findIndex(
      d => d.name.toLowerCase() === name.toLowerCase(),
    );

    if (index === -1) {
      throw new NotFoundException(
        `Dispositivo no encontrado`,
      );
    }

    this.devices.splice(index, 1);

    return {
      message: `Dispositivo eliminado`,
    };
  }
}
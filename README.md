# 🌐 Network Monitor API

> API REST para el Sistema de Monitoreo de Red Empresarial  
> Construida con **NestJS** + **MongoDB Atlas** | Lista para desplegar en **Render**

---

## 📁 Estructura del Proyecto

```
network-monitor-api/
├── src/
│   ├── main.ts                          # Punto de entrada (CORS, Swagger, ValidationPipe)
│   ├── app.module.ts                    # Módulo raíz + conexión MongoDB
│   │
│   ├── metrics/                         # 📊 Módulo de métricas
│   │   ├── schemas/metric.schema.ts     # Modelo de datos Mongoose
│   │   ├── dto/create-metric.dto.ts     # Validación de entrada
│   │   ├── dto/query-metric.dto.ts      # Filtros de consulta
│   │   ├── metrics.service.ts           # Lógica de negocio
│   │   ├── metrics.controller.ts        # Endpoints REST
│   │   └── metrics.module.ts
│   │
│   ├── devices/                         # 🖥️ Módulo de dispositivos
│   │   ├── schemas/device.schema.ts
│   │   ├── dto/create-device.dto.ts
│   │   ├── devices.service.ts
│   │   ├── devices.controller.ts
│   │   └── devices.module.ts
│   │
│   └── health/                          # ❤️ Health check
│       └── health.module.ts
│
├── network_monitor.py                   # Script Python que envía métricas
├── .env.example                         # Variables de entorno (¡copia a .env!)
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🚀 Instalación Local (paso a paso)

### 1. Instalar dependencias
```bash
cd network-monitor-api
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos
```

### 3. Configurar MongoDB Atlas (gratis)
1. Ir a [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear cuenta gratuita
3. Crear un cluster (Free Tier - M0)
4. En **Network Access** → agregar `0.0.0.0/0` (permite todas las IPs)
5. En **Database Access** → crear usuario con contraseña
6. En **Connect** → copiar la URI de conexión
7. Pegar la URI en tu `.env`:
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/network-monitor
   ```

### 4. Correr en modo desarrollo
```bash
npm run start:dev
```

La API estará en: **http://localhost:3000/api/v1**  
Documentación Swagger: **http://localhost:3000/docs**

---

## 📡 Endpoints Disponibles

### Métricas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/metrics` | Guardar métrica (lo usa el script Python) |
| `GET` | `/api/v1/metrics` | Todas las métricas (con paginación y filtros) |
| `GET` | `/api/v1/metrics/summary` | Resumen estadístico para el dashboard |
| `GET` | `/api/v1/metrics/latest` | Última métrica de cada dispositivo |
| `GET` | `/api/v1/metrics/:device` | Historial de un dispositivo específico |
| `GET` | `/api/v1/metrics/:device/timeseries` | Serie temporal para gráficas |
| `DELETE` | `/api/v1/metrics/cleanup` | Limpiar métricas antiguas |

### Dispositivos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/devices` | Registrar dispositivo |
| `GET` | `/api/v1/devices` | Listar dispositivos |
| `GET` | `/api/v1/devices/status` | Estado en tiempo real de todos |
| `GET` | `/api/v1/devices/:name/status` | Estado de un dispositivo |
| `PUT` | `/api/v1/devices/:name` | Actualizar dispositivo |
| `DELETE` | `/api/v1/devices/:name` | Eliminar dispositivo |

### Sistema
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Estado de la API y MongoDB |

---

## 📊 Formato de Datos

### Enviar métrica (POST /api/v1/metrics)
```json
{
  "device": "Router-1",
  "latency": 15,
  "packetLoss": 2,
  "bandwidth": 120,
  "status": "online",
  "ipAddress": "192.168.1.1",
  "location": "Edificio A - Piso 2"
}
```

**Campos obligatorios:** `device`, `latency`, `packetLoss`, `bandwidth`, `status`  
**Estado válidos:** `online` | `offline` | `warning` | `critical`

---

## 🐍 Script Python

```bash
# Instalar dependencia
pip install requests

# Ejecutar el monitoreo
python network_monitor.py
```

El script envía métricas de todos los dispositivos cada 30 segundos.

---

## ☁️ Deploy en Render (GRATUITO)

### Paso 1: Subir código a GitHub
```bash
git init
git add .
git commit -m "API Network Monitor lista"
git remote add origin https://github.com/tu-usuario/network-monitor-api.git
git push -u origin main
```

### Paso 2: Configurar Render
1. Ir a [render.com](https://render.com) → Crear cuenta
2. **New** → **Web Service**
3. Conectar tu repositorio de GitHub
4. Configurar:
   - **Name:** `network-monitor-api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** `Node`
5. En **Environment Variables** agregar:
   - `MONGODB_URI` = tu URI de MongoDB Atlas
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = URL de tu dashboard Next.js

### Paso 3: Deploy
- Hacer clic en **Create Web Service**
- Render construye y despliega automáticamente
- Tu API quedará en: `https://network-monitor-api.onrender.com`

> ⚠️ **Nota:** El plan gratuito de Render "duerme" después de 15 minutos sin tráfico.  
> Para proyectos universitarios esto está bien. El script Python lo "despierta" al enviar métricas.

---

## 🔧 Pruebas con Postman

### Importar colección
Puedes probar todos los endpoints desde [Swagger UI](http://localhost:3000/docs) o con Postman.

### Ejemplo de prueba rápida con curl
```bash
# Verificar que la API funciona
curl http://localhost:3000/api/v1/health

# Enviar una métrica de prueba
curl -X POST http://localhost:3000/api/v1/metrics \
  -H "Content-Type: application/json" \
  -d '{"device":"Router-1","latency":15,"packetLoss":2,"bandwidth":120,"status":"online"}'

# Ver todas las métricas
curl http://localhost:3000/api/v1/metrics

# Ver estado de dispositivos
curl http://localhost:3000/api/v1/devices/status
```

---

## 🏗️ Arquitectura Completa

```
Cisco Packet Tracer
        │
        ▼
Script Python (network_monitor.py)
  - Obtiene métricas de la red simulada
  - Envía POST /api/v1/metrics cada 30s
        │
        ▼
API REST NestJS (esta API)
  - Valida los datos con class-validator
  - Aplica CORS para el dashboard
  - Expone endpoints para dashboard
        │
        ▼
MongoDB Atlas (nube)
  - Colección: metrics
  - Colección: devices
  - Índices optimizados para consultas
        │
        ▼
Dashboard Next.js
  - Consulta GET /api/v1/devices/status
  - Consulta GET /api/v1/metrics/summary
  - Consulta GET /api/v1/metrics/:device/timeseries
```

---

## 📝 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | URI de MongoDB Atlas | `mongodb+srv://...` |
| `DB_NAME` | Nombre de la BD | `network-monitor` |
| `NODE_ENV` | Entorno | `development` |
| `CORS_ORIGIN` | Orígenes permitidos | `http://localhost:3001` |

---

*Proyecto Universitario - Sistema de Monitoreo de Red Empresarial*

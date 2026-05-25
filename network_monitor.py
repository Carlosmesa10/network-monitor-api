"""
╔══════════════════════════════════════════════════════════════════════════════╗
║         SCRIPT DE MONITOREO DE RED - Sistema de Monitoreo Empresarial       ║
║         Envía métricas desde Cisco Packet Tracer a la API NestJS             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Uso:
    pip install requests
    python network_monitor.py

En producción (cuando tu API esté en Render):
    Cambia API_URL a la URL de Render
"""

import requests
import random
import time
import json
from datetime import datetime

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
API_URL = "http://localhost:3000/api/v1"   # Local
# API_URL = "https://tu-api.onrender.com/api/v1"  # Producción en Render

INTERVALO_SEGUNDOS = 30  # Enviar métricas cada 30 segundos

# Lista de dispositivos a monitorear (los mismos que tienes en Packet Tracer)
DISPOSITIVOS = [
    {"name": "Router-1",   "ip": "192.168.1.1",  "type": "router"},
    {"name": "Router-2",   "ip": "192.168.1.2",  "type": "router"},
    {"name": "Switch-1",   "ip": "192.168.1.10", "type": "switch"},
    {"name": "Switch-2",   "ip": "192.168.1.11", "type": "switch"},
    {"name": "Firewall-1", "ip": "10.0.0.1",     "type": "firewall"},
]


# ─── FUNCIÓN: Simular métricas (reemplazar con datos reales de Packet Tracer) ─
def obtener_metricas(dispositivo: dict) -> dict:
    """
    En un entorno real, aquí harías:
    - ping para medir latencia
    - SNMP para ancho de banda
    - Verificación de puertos TCP para estado

    Por ahora simulamos con valores realistas.
    """
    nombre = dispositivo["name"]

    # Simular algunos dispositivos con problemas ocasionales
    tiene_problema = random.random() < 0.1  # 10% de probabilidad

    if tiene_problema:
        latencia = random.uniform(150, 500)    # Alta latencia
        perdida = random.uniform(10, 40)        # Alta pérdida de paquetes
        ancho_banda = random.uniform(5, 30)     # Poco ancho de banda
        estado = random.choice(["warning", "critical", "offline"])
    else:
        latencia = random.uniform(1, 50)        # Latencia normal (ms)
        perdida = random.uniform(0, 3)          # Pérdida normal (%)
        ancho_banda = random.uniform(50, 200)   # Ancho de banda normal (Mbps)
        estado = "online"

    return {
        "device": nombre,
        "latency": round(latencia, 2),
        "packetLoss": round(perdida, 2),
        "bandwidth": round(ancho_banda, 2),
        "status": estado,
        "ipAddress": dispositivo.get("ip"),
    }


# ─── FUNCIÓN: Enviar métrica a la API ─────────────────────────────────────────
def enviar_metrica(metrica: dict) -> bool:
    try:
        response = requests.post(
            f"{API_URL}/metrics",
            json=metrica,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )

        if response.status_code == 201:
            print(f"  ✅ {metrica['device']}: latencia={metrica['latency']}ms | "
                  f"pérdida={metrica['packetLoss']}% | "
                  f"ancho de banda={metrica['bandwidth']}Mbps | "
                  f"estado={metrica['status']}")
            return True
        else:
            print(f"  ❌ Error {response.status_code} para {metrica['device']}: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"  🔴 No se puede conectar a la API ({API_URL}). ¿Está corriendo?")
        return False
    except requests.exceptions.Timeout:
        print(f"  ⏱️  Timeout al enviar métrica de {metrica['device']}")
        return False
    except Exception as e:
        print(f"  ⚠️  Error inesperado: {e}")
        return False


# ─── FUNCIÓN: Verificar que la API está activa ────────────────────────────────
def verificar_api() -> bool:
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"🟢 API conectada | Base de datos: {data.get('database', {}).get('status', '?')}")
            return True
        return False
    except Exception:
        print(f"🔴 API no disponible en {API_URL}")
        return False


# ─── BUCLE PRINCIPAL ──────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  SISTEMA DE MONITOREO DE RED - Script Python")
    print("=" * 65)
    print(f"  API: {API_URL}")
    print(f"  Dispositivos monitoreados: {len(DISPOSITIVOS)}")
    print(f"  Intervalo de envío: {INTERVALO_SEGUNDOS}s")
    print("=" * 65)

    # Verificar conexión con la API
    if not verificar_api():
        print("\n⚠️  Asegúrate de que la API esté corriendo:")
        print("   cd network-monitor-api && npm run start:dev")
        print("\n   Continuando de todos modos...\n")

    ciclo = 0
    while True:
        ciclo += 1
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n📡 Ciclo #{ciclo} - {timestamp}")
        print("-" * 50)

        enviadas = 0
        for dispositivo in DISPOSITIVOS:
            metrica = obtener_metricas(dispositivo)
            if enviar_metrica(metrica):
                enviadas += 1

        print(f"\n  📊 {enviadas}/{len(DISPOSITIVOS)} métricas enviadas correctamente")
        print(f"  ⏳ Próximo envío en {INTERVALO_SEGUNDOS} segundos...")
        time.sleep(INTERVALO_SEGUNDOS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Monitoreo detenido por el usuario.")


# ─── EJEMPLO: Envío manual de una sola métrica ────────────────────────────────
# Si quieres enviar una métrica manualmente sin el bucle:
#
# metrica = {
#     "device": "Router-1",
#     "latency": 15,
#     "packetLoss": 2,
#     "bandwidth": 120,
#     "status": "online",
#     "ipAddress": "192.168.1.1"
# }
# requests.post("http://localhost:3000/api/v1/metrics", json=metrica)

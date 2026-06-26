"""
Test manual: POST /supplies → DELETE /supplies/{id}

Uso:
  TEST_USERNAME=admin TEST_PASSWORD=admin python -m scripts.test_delete_supply

Requiere:
  - Backend corriendo (docker-compose up o uvicorn)
  - Variables de entorno TEST_USERNAME y TEST_PASSWORD seteadas
  - brand_id=1, base_uom_id=1 existentes en la BD
"""

import asyncio
import os
import sys
import httpx

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
SUPPLIES_URL = f"{BASE_URL}/supplies"

# Credenciales leídas de variables de entorno
_username = os.environ.get("TEST_USERNAME")
_password = os.environ.get("TEST_PASSWORD")

if not _username or not _password:
    print("❌ Faltan variables de entorno: TEST_USERNAME y TEST_PASSWORD")
    print("   Uso: TEST_USERNAME=admin TEST_PASSWORD=admin python -m scripts.test_delete_supply")
    sys.exit(1)

CREDENTIALS = {
    "username": _username,
    "password": _password,
}

# Payload del insumo de prueba (brand_id=1, base_uom_id=1 del seed)
CREATE_PAYLOAD = {
    "name": "Insumo TEST DELETE",
    "brand_id": 1,
    "base_uom_id": 1,
    "min_stock_level": 5,
    "supply_category": "Otro",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _separator(title: str) -> None:
    print(f"\n{'─' * 60}")
    print(f"  {title}")
    print(f"{'─' * 60}")


def _ok(msg: str) -> None:
    print(f"  ✅ {msg}")


def _fail(msg: str) -> None:
    print(f"  ❌ {msg}")


def _info(label: str, value) -> None:
    print(f"  {label}: {value}")


# ── Test steps ────────────────────────────────────────────────────────────────

async def run() -> None:
    async with httpx.AsyncClient(timeout=10.0) as client:

        # ── PASO 0: Login ──────────────────────────────────────────────────
        _separator("PASO 0 — Obtener token JWT")
        resp = await client.post(LOGIN_URL, json=CREDENTIALS)
        if resp.status_code != 200:
            _fail(f"Login fallido [{resp.status_code}]: {resp.text}")
            return
        token = resp.json().get("access_token")
        _ok(f"Token: {token[:30]}...")
        headers = {"Authorization": f"Bearer {token}"}

        # ── PASO 1: POST /supplies ─────────────────────────────────────────
        _separator("PASO 1 — POST /supplies")
        _info("Payload", CREATE_PAYLOAD)

        resp = await client.post(SUPPLIES_URL, json=CREATE_PAYLOAD)
        _info("Status", resp.status_code)
        _info("Body", resp.json())

        if resp.status_code != 201:
            _fail("El POST no devolvió 201. Abortando.")
            return

        created = resp.json()
        supply_id = created["id"]
        _ok(f"Insumo creado con id={supply_id}, name='{created['name']}'")

        # ── PASO 2: GET /supplies/{id} — verificar que existe ─────────────
        _separator("PASO 2 — GET /supplies/{id} (verificar existencia)")
        resp = await client.get(f"{SUPPLIES_URL}/{supply_id}", headers=headers)
        _info("Status", resp.status_code)

        if resp.status_code == 200:
            _ok("Insumo visible en GET detallado")
        else:
            _fail(f"No se pudo obtener el detalle: {resp.text}")

        # ── PASO 3: DELETE /supplies/{id} ─────────────────────────────────
        _separator("PASO 3 — DELETE /supplies/{id}")
        resp = await client.delete(f"{SUPPLIES_URL}/{supply_id}", headers=headers)
        _info("Status", resp.status_code)
        _info("Body", resp.json())

        if resp.status_code == 200:
            _ok(f"Soft delete OK — id={supply_id}")
        elif resp.status_code == 409:
            _fail("409 CONFLICT: el insumo tiene stock activo")
        elif resp.status_code == 404:
            _fail("404 NOT FOUND: el insumo no existe")
        else:
            _fail(f"Respuesta inesperada: {resp.status_code}")

        # ── PASO 4: GET /supplies/{id} — debe devolver 404 ────────────────
        _separator("PASO 4 — GET /supplies/{id} (verificar que ya no aparece)")
        resp = await client.get(f"{SUPPLIES_URL}/{supply_id}", headers=headers)
        _info("Status", resp.status_code)

        if resp.status_code == 404:
            _ok("Correcto: el insumo ya no es accesible (soft-deleted)")
        elif resp.status_code == 200:
            _fail("El insumo sigue siendo accesible después del delete — posible bug")
        else:
            _info("Respuesta inesperada", resp.text)

        _separator("FIN")


if __name__ == "__main__":
    asyncio.run(run())

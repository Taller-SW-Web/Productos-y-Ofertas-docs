# WF-015 — Control de stock y disponibilidad

> **Fuente normativa de esta revisión:** `SPEC-015-control-stock-disponibilidad.md` y `HU-015-control-stock-disponibilidad.md` (21-09-2026). El alcance se centra en la consulta de disponibilidad (`available`), reservas (`reserve`), consumos (`consume`) y control Kardex por `(sku, location_id)` con concurrencia optimista `stock_version`.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para el **Control de Stock y Disponibilidad** de variantes del Marketplace.

Antes de diseñar:
1. Consulta ../../specs/SPEC-015-control-stock-disponibilidad.md.
2. Consulta ../../hu/HU-015-control-stock-disponibilidad.md.
3. Consulta ../../DESIGN.md.

Reglas de producción:
- La unidad de saldo operativo es `(sku, location_id)`.
- Fórmulas de cálculo: `available = on_hand - reserved`.
- Estados calculados:
  - `Agotado`: `available == 0`
  - `Stock bajo`: `0 < available <= umbral_efectivo`
  - `Disponible`: `available > umbral_efectivo`
- La interfaz administrativa es de **consulta y visualización de saldos y Kardex de movimientos**. Las operaciones de reserva y consumo se originan en el proceso de venta asíncrono EDA.
- Simular control de concurrencia optimista `stock_version` y pantalla de conflicto `S-03-C`.
- No renderizar etiquetas `A-xx` dentro de la interfaz.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-015 |
| Nombre del flujo | Control de stock y disponibilidad |
| Versión | 1.0 (Consolidada) |
| Estado | Completado |
| Responsable | Miguel Ángel Taco Zavala (`taco`) |
| Fecha | 2026-09-21 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-015-control-stock-disponibilidad.md, secciones 1–6 | Contrato de saldos, Kardex y control de versiones |
| Historia de usuario | HU-015-control-stock-disponibilidad.md, CA-01 a CA-17 | Criterios de disponibilidad y cálculo de estados |
| Diseño | DESIGN.md | Guía visual monocromática |

---

## 3. Matriz de Pantallas y Estados

| ID Pantalla | Nombre de Pantalla | Tipo | Descripción |
|---|---|---|---|
| `S-01` | Consulta de Inventario y Disponibilidad | Principal | Listado de SKUs con desglose de `on_hand`, `reserved`, `available`, estado y almacén. |
| `S-01-E` | Error / Vacío de Consulta | Estado alterno | Manejo de fallo de conexión o búsqueda sin coincidencias. |
| `S-02` | Detalle de Disponibilidad por SKU | Principal | Vista detallada del SKU con desglose por ubicación/tienda y configuración de umbral. |
| `S-02-U` | Modal Configurar Umbral | Modal | Ajuste de umbral de stock bajo por SKU / ubicación. |
| `S-03` | Panel Informativo de Movimientos Kardex | Principal | Historial de movimientos (reservas, consumos, ajustes) en solo lectura. |
| `S-03-C` | Conflicto de Concurrencia (409) | Modal / Alerta | Simulación de conflicto de versión (`stock_version` obsoleto ante consumo concurrente). |

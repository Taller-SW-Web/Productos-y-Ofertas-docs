# HU-009 — Historia de Usuario: Gestión de características y sus valores

**Como** **gestor comercial**,

**quiero** administrar características tipadas y sus valores identificados por ID

**para** contar con un catálogo de atributos estandarizado.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe limitar los valores de tipo `TEXTO` a 100 caracteres máximo. |
| **CA-02** | Para tipo `NUMERO`, se exige unidad de medida y validación estricta de formato numérico. |
| **CA-03** | El sistema debe limitar a un máximo de 50 valores activos por característica tipo `LISTA`. |
| **CA-04** | Al renombrar un valor de característica en uso, conserva su ID y el nombre actualizado se refleja en consultas actuales tras la propagación por eventos, sin reescribir SKUs existentes ni snapshots de pedidos. |
| **CA-05** | La consulta de características entrega ID, tipo, estado, unidad cuando corresponde y valores permitidos con IDs estables. |
| **CA-06** | Renombrar un valor LISTA conserva su ID; la actualización de las vistas de Catálogo es por evento y no reescribe pedidos históricos ni atributos identificadores de SKUs existentes. |
| **CA-07** | La asociación, herencia y límites dependen de `HU-010-asociacion-categoria-caracteristica.md`; el CRUD de marcas depende de `HU-011-gestion-marcas.md`. |
| **CA-08** | El tipo de una característica es inmutable desde su creación; intentar editarlo se rechaza, indicando que debe crearse otra característica. |
| **CA-09** | Desactivar un valor LISTA es baja lógica mediante verificación asíncrona correlacionada con Catálogo; si existe un SKU ACTIVO cuya identidad usa el valor o un producto ACTIVO que lo requiere, se rechaza. Durante la comprobación no se asigna el valor a nuevos productos/variantes; fallo o ausencia de respuesta no autoriza la baja. Se conservan histórico, IDs y referencias anteriores. |

## Escenarios dado-cuando-entonces

**Escenario 1: Renombrar valor de lista por ID**
* **DADO** un valor de lista asociado a productos y conservado por ID,
* **CUANDO** el gestor lo renombra,
* **ENTONCES** conserva el ID y notifica el cambio para que las consultas de Catálogo muestren el nombre actualizado sin alterar SKUs inmutables ni snapshots históricos.

**Escenario 2: Rechazar más de 50 valores activos**
* **DADO** una característica LISTA con 50 valores activos,
* **CUANDO** se intenta añadir un valor activo adicional,
* **ENTONCES** se rechaza la operación.

**Escenario 3: Rechazar cambio de tipo**
* **DADO** una característica LISTA ya registrada,
* **CUANDO** el gestor intenta convertirla en TEXTO,
* **ENTONCES** se rechaza y se conserva su tipo y valores.

**Escenario 4: Proteger valor en uso activo**
* **DADO** un valor LISTA utilizado como identidad de una variante ACTIVA,
* **CUANDO** se solicita su baja,
* **ENTONCES** el sistema la rechaza tras la comprobación asíncrona; no altera el SKU ni el histórico.

## Reglas resueltas (antes pendientes)
* **Límites de características:** Formalizados a 50 (lista) y 100 chars (texto). Renombre opera por ID.
* **Marcas y Asociación:** sus reglas son propiedad de sus HU individuales, no de esta historia.

---

# HU-009 — Historia de Usuario: Gestión de características y sus valores

**Responsable:** Leonardo Lopez  
**Rama:** lopez  
**Trazabilidad:** Spec [SPEC-009](../specs/SPEC-009-gestion-caracteristicas.md) | Flow [WF-009](../wireframes/flows/WF-009-gestion-caracteristicas.md)

**Como** **gestor comercial**,

**quiero** administrar características tipadas y sus valores identificados por ID

**para** contar con un catálogo de atributos estandarizado.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | Los valores de tipo `TEXTO` deben respetar un límite técnico configurable; para el MVP se usa 100 caracteres como valor inicial, sin convertirlo en una restricción empresarial permanente. |
| **CA-02** | Para tipo `NUMERO`, se exige unidad de medida y validación estricta de formato numérico. |
| **CA-03** | Las características tipo `LISTA` deben respetar un máximo técnico configurable de valores activos; para el MVP se usa 50 como valor inicial. |
| **CA-04** | Al renombrar un valor de característica en uso, conserva su ID y el nombre actualizado se refleja en consultas actuales tras la propagación por eventos, sin reescribir SKUs existentes ni snapshots de pedidos. |
| **CA-05** | La consulta de características entrega ID, tipo, estado, unidad cuando corresponde y valores permitidos con IDs estables. |
| **CA-06** | Renombrar un valor LISTA conserva su ID; la actualización de las vistas de Catálogo es por evento y no reescribe pedidos históricos ni atributos identificadores de SKUs existentes. |
| **CA-07** | La asociación de características al esquema de producto y sus límites depende de `HU-010-asociacion-tipo-producto-caracteristica.md`, que usa tipo de producto como autoridad normativa; las categorías no heredan características. El CRUD de marcas depende de `HU-011-gestion-marcas.md`. |
| **CA-08** | El tipo de una característica es inmutable desde su creación; intentar editarlo se rechaza, indicando que debe crearse otra característica. |
| **CA-09** | Desactivar un valor LISTA es baja lógica mediante verificación asíncrona correlacionada con Catálogo; si existe un SKU ACTIVO cuya identidad usa el valor o un producto ACTIVO que lo requiere, se rechaza. Durante la comprobación no se asigna el valor a nuevos productos/variantes; fallo o ausencia de respuesta no autoriza la baja. Se conservan histórico, IDs y referencias anteriores. |

## Escenarios dado-cuando-entonces

**Escenario 1: Renombrar valor de lista por ID**
* **DADO** un valor de lista asociado a productos y conservado por ID,
* **CUANDO** el gestor lo renombra,
* **ENTONCES** conserva el ID y notifica el cambio para que las consultas de Catálogo muestren el nombre actualizado sin alterar SKUs inmutables ni snapshots históricos.

**Escenario 2: Rechazar al superar el límite configurado de valores activos**
* **DADO** una característica LISTA que alcanzó el límite técnico configurado, cuyo valor inicial del MVP es 50,
* **CUANDO** se intenta añadir un valor activo adicional,
* **ENTONCES** se rechaza la operación e informa el límite vigente.

**Escenario 3: Rechazar cambio de tipo**
* **DADO** una característica LISTA ya registrada,
* **CUANDO** el gestor intenta convertirla en TEXTO,
* **ENTONCES** se rechaza y se conserva su tipo y valores.

**Escenario 4: Proteger valor en uso activo**
* **DADO** un valor LISTA utilizado como identidad de una variante ACTIVA,
* **CUANDO** se solicita su baja,
* **ENTONCES** el sistema la rechaza tras la comprobación asíncrona; no altera el SKU ni el histórico.

## Reglas resueltas (antes pendientes)
* **Límites de características:** Son guardrails técnicos configurables; el MVP parte de 50 valores activos para LISTA y 100 caracteres para TEXTO. Renombre opera por ID.
* **Marcas y Asociación:** sus reglas son propiedad de sus HU individuales; la asociación se realiza contra **tipos de producto**, no mediante herencia de categorías.

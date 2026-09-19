# SPEC-008 — Especificación: Gestión de categorías y subcategorías

## 1. Contexto
El Marketplace Multicanal organiza los productos en categorías y subcategorías para navegación, filtros y clasificación en Catálogo Core. La estructura se administra centralmente en Taxonomía y se expone por API.

## 2. Propósito
Permitir al Gestor Comercial crear, consultar, actualizar, desactivar y reactivar categorías, manteniendo una jerarquía consistente de máximo dos niveles.

## 3. Alcance
Incluye:
- Categorías raíz y subcategorías.
- Máximo dos niveles: raíz e hija.
- Edición de `categoria_padre_id`.
- Consulta individual, listado y árbol jerárquico.
- Baja lógica y reactivación.
- Validación asíncrona, con confirmación de Catálogo y barrera concurrente, de productos activos antes de desactivar.
- API de solo lectura para canales y Catálogo Core.

## 4. Requisitos

### Requisito 1: Crear categoría
El sistema DEBE permitir crear una categoría con nombre, descripción y `categoria_padre_id` opcional.

El nombre NO necesita ser único. La unicidad de URL se resuelve mediante la política de slug definida en `SPEC-012-seo-metadatos.md`.

Si se especifica padre, este debe existir y estar activo.

### Requisito 2: Jerarquía
La jerarquía admite únicamente:
1. categoría raíz;
2. subcategoría.

No se permiten terceros niveles ni referencias circulares.

### Requisito 3: Actualizar categoría
El sistema DEBE permitir editar nombre, descripción, orden, imagen y `categoria_padre_id`.

Al cambiar el padre se valida:
- existencia y estado activo del nuevo padre;
- ausencia de autorreferencia/ciclo;
- cumplimiento del máximo de dos niveles.

El cambio de ubicación no altera automáticamente los productos ya asociados.

### Requisito 4: Desactivar categoría
Toda baja es lógica. El sistema NUNCA elimina físicamente una categoría.

La desactivación se bloquea si:
- posee subcategorías activas; o
- existen productos activos asociados.

La existencia de productos activos se verifica mediante la coordinación asíncrona con Catálogo Core definida a continuación. La solicitud puede permanecer pendiente; una validación inexistente, fallida o vencida NUNCA autoriza la baja.

### Requisito 5: Reactivar categoría
Una categoría inactiva puede reactivarse. Si tiene padre, este debe estar activo.

### Requisito 6: Consultar árbol
El sistema DEBE exponer el árbol jerárquico completo, incluyendo categorías activas e inactivas, para uso administrativo conforme a permisos. Para Catálogo Core y canales externos, la API de consumo DEBE exponer únicamente categorías activas; una categoría inactiva no forma parte del árbol público/consumible.

### Contrato transversal para baja segura de entidades maestras (EDA)

La desactivación de categoría o marca que pueda tener productos asociados es **una operación asíncrona de dos fases funcionales**, no una llamada HTTP entre servicios. Taxonomía registra la operación `PENDING_DEACTIVATION` con `operation_id`, `entity_type`, `entity_id` y `version`, y publica el comando `taxonomy.master.deactivation.check.requested`. Catálogo, en una transacción local, instala una barrera de escritura por entidad (impide crear, activar o reasignar productos a ella mientras dure la operación), revisa todos los productos activos asociados y publica `catalog.master.deactivation.checked` con el mismo `operation_id`, versión y resultado `HAS_ACTIVE_PRODUCTS` o `CLEAR`. La barrera debe participar de las mismas transacciones de escritura de producto para evitar carreras.

Taxonomía **solo confirma la baja lógica tras un resultado `CLEAR` vigente**; si hay productos activos, timeout o error, deja la entidad activa y registra rechazo o estado pendiente recuperable, nunca éxito supuesto. Publica `taxonomy.master.deactivated` o `taxonomy.master.deactivation.rejected`; Catálogo libera la barrera tras procesar idempotentemente ese resultado. La caída de un servicio no autoriza liberar automáticamente una barrera sin reconciliar el estado por `operation_id`. Los consumidores de canales actualizan sus vistas por eventos; durante la propagación no deben prometer visibilidad instantánea global. **No existe transacción distribuida** ni validación HTTP síncrona entre Catálogo y Taxonomía.

La desactivación de una categoría sigue bloqueándose cuando tiene subcategorías activas, comprobación local de Taxonomía. La reactivación vuelve a validar padre y unicidad aplicable según el tipo de entidad. Este protocolo es interno y no presupone contratos confirmados con Ventas y Postventa.

### Requisito 7: Reubicación segura de categoría
Antes de confirmar el cambio de `categoria_padre_id`, Taxonomía calcula las características **efectivas** (directas + heredadas, sin duplicados) de la categoría trasladada y de todas las subcategorías que pudiera afectar. Rechaza el cambio si alguna excede 20, si relaja una obligatoriedad heredada, si crea un ciclo o si excede dos niveles. El cambio se confirma atómicamente con la actualización de la jerarquía y la versión de taxonomía y emite `taxonomy.category.updated`. Si aparecen nuevas características obligatorias, los productos ya existentes conservan su estado y las completan en el próximo guardado; las nuevas creaciones/activaciones deben satisfacerlas. Catálogo valida escrituras sobre una versión vigente de las reglas, no sobre proyecciones conocidas como obsoletas.

## 5. Requisitos no funcionales
- Rendimiento: árbol completo < 1 s con hasta 500 categorías.
- Seguridad: escritura restringida a Gestor Comercial.
- Disponibilidad: API de categorías activas disponible para Catálogo Core y canales.
- Auditoría: registrar creación y modificación con fecha/hora y usuario.

## 6. Fuera de alcance
- CRUD de características y marcas.
- Asociación categoría-característica, definida en `SPEC-010-asociacion-categoria-caracteristica.md`.
- Metadatos SEO; el slug y sus colisiones se rigen por `SPEC-012-seo-metadatos.md`.
- Asociación de productos a categoría, responsabilidad de Catálogo Core.

## Criterio de completitud
Se considera completa cuando se cumplen creación, jerarquía de dos niveles, edición de padre, baja lógica, reactivación, validación de productos activos y consulta del árbol.

---

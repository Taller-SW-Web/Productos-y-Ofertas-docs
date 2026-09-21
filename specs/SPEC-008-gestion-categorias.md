# SPEC-008 — Especificación: Gestión de categorías y subcategorías

**Responsable:** Leonardo Lopez  
**Rama:** lopez  
**Trazabilidad:** HU [HU-008](../hu/HU-008-gestion-categorias.md) | Wireframe [WF-008](../wireframes/flows/WF-008-gestion-categorias.md)

## 1. Contexto
El Marketplace Multicanal organiza los productos en categorías y subcategorías para navegación, filtros y clasificación en Catálogo Core. La estructura se administra centralmente en Taxonomía y se expone por API.

## 2. Propósito
Permitir al Gestor Comercial crear, consultar, actualizar, desactivar y reactivar categorías de navegación. El modelo de datos es jerárquico y recursivo; para el MVP se configura `MAX_CATEGORY_DEPTH=2` (categoría y subcategoría), evitando que el límite docente quede embebido como una imposibilidad estructural permanente.

## 3. Alcance
Incluye:
- Categorías raíz y subcategorías.
- Modelo jerárquico mediante `categoria_padre_id`; `MAX_CATEGORY_DEPTH=2` como configuración del MVP, no como restricción irreversible del esquema.
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
El modelo admite una jerarquía recursiva basada en `categoria_padre_id`, sin referencias circulares. Para el alcance actual, `MAX_CATEGORY_DEPTH=2`, por lo que la interfaz y las validaciones solo permiten:
1. categoría raíz;
2. subcategoría.

La profundidad máxima es un parámetro de negocio/técnico del despliegue y puede ampliarse en una evolución sin rediseñar la entidad ni las APIs básicas.

### Requisito 3: Actualizar categoría
El sistema DEBE permitir editar nombre, descripción, orden, imagen y `categoria_padre_id`.

Al cambiar el padre se valida:
- existencia y estado activo del nuevo padre;
- ausencia de autorreferencia/ciclo;
- cumplimiento de `MAX_CATEGORY_DEPTH` vigente (2 en el MVP).

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
Antes de confirmar el cambio de `categoria_padre_id`, Taxonomía comprueba existencia y estado del nuevo padre, ausencia de ciclos y cumplimiento de `MAX_CATEGORY_DEPTH`. El cambio se confirma atómicamente con la versión de taxonomía y emite `taxonomy.category.updated`; los consumidores actualizan sus proyecciones de forma eventual. **Las categorías se usan para navegación y clasificación, no para definir el esquema de atributos del producto**, por lo que reubicar una categoría no añade ni elimina características obligatorias de los productos existentes. El esquema de atributos se resuelve mediante `tipo_producto_id` y la capacidad de asociación definida en `SPEC-010-asociacion-tipo-producto-caracteristica.md`.

## 5. Requisitos no funcionales
- Rendimiento: árbol completo < 1 s con hasta 500 categorías.
- Seguridad: escritura restringida a Gestor Comercial.
- Disponibilidad: API de categorías activas disponible para Catálogo Core y canales.
- Auditoría: registrar creación y modificación con fecha/hora y usuario.

## 6. Fuera de alcance
- CRUD de características y marcas.
- Definición del esquema de atributos por tipo de producto, especificada en `SPEC-010-asociacion-tipo-producto-caracteristica.md`; las categorías no son propietarias de esas reglas.
- Metadatos SEO; el slug y sus colisiones se rigen por `SPEC-012-seo-metadatos.md`.
- Asociación de productos a categoría, responsabilidad de Catálogo Core.

## Criterio de completitud
Se considera completa cuando se cumplen creación, jerarquía recursiva con profundidad 2 configurada para el MVP, edición de padre, baja lógica, reactivación, validación de productos activos y consulta del árbol, sin acoplar la jerarquía de navegación al esquema de características.

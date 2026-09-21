# SPEC-011 — Especificación: Gestión de marcas

**Responsable:** Leonardo Lopez  
**Rama:** lopez  
**Trazabilidad:** HU [HU-011](../hu/HU-011-gestion-marcas.md) | Wireframe [WF-011](../wireframes/flows/WF-011-gestion-marcas.md)

## 1. Contexto
Los productos del Marketplace deportivo pertenecen a distintas marcas (ej. Nike, Adidas, Wilson). Los clientes necesitan poder filtrar y navegar el catálogo por marca, y el módulo de Catálogo Core necesita asociar cada producto a una marca válida al momento de registrarlo. Esta gestión debe centralizarse en el sub-módulo de Taxonomía, igual que categorías y características.

## 2. Propósito
Permitir al gestor comercial crear, consultar, actualizar, desactivar y reactivar las marcas del catálogo, incluyendo su logo, para que sirvan de base a la clasificación de productos y a la navegación por marca en los canales de venta.

## 3. Alcance
Incluye:
- Creación de marcas (nombre, descripción, logo, país de origen opcional).
- Consulta de una marca por ID y listado con filtros y paginación.
- Actualización de los datos de una marca, incluyendo su logo.
- Desactivación y reactivación de una marca (baja lógica, nunca eliminación física).
- Exposición de un endpoint de solo lectura para que otros módulos (Catálogo Core, canales) consulten marcas activas.

## 4. Requisitos

### Requisito 1: Creación de marca
El sistema DEBE permitir crear una marca con nombre globalmente único tras normalizar espacios y mayúsculas/minúsculas (incluidas marcas inactivas), descripción opcional, logo (PNG, JPG/JPEG o WebP, máximo 5 MB) y país de origen opcional identificado mediante código ISO 3166-1.

#### Escenario: Creación exitosa de una marca
- DADO que el gestor comercial está autenticado
- CUANDO crea la marca "Nike" con descripción y logo válidos
- ENTONCES el sistema registra la marca con estado ACTIVO

#### Escenario: Intento de crear una marca con nombre duplicado
- DADO que ya existe una marca activa con el nombre "Nike"
- CUANDO el gestor comercial intenta crear otra marca con el mismo nombre
- ENTONCES el sistema rechaza la operación e indica que el nombre de marca ya existe

### Requisito 2: Actualización de marca
El sistema DEBE permitir modificar el nombre, descripción, logo y país de origen de una marca existente, sin afectar los productos ya asociados a ella.

#### Escenario: Actualización exitosa del logo de una marca
- DADO que existe la marca "Nike" con un logo registrado
- CUANDO el gestor comercial sube un nuevo archivo de logo
- ENTONCES el sistema reemplaza el logo anterior y actualiza el campo updated_at

#### Escenario: Intento de actualizar una marca inexistente
- DADO que no existe ninguna marca con id 999
- CUANDO el gestor comercial intenta actualizar la marca con id 999
- ENTONCES el sistema devuelve un error indicando que la marca no fue encontrada

#### Escenario: Intento de subir un logo que excede el tamaño máximo
- DADO que el gestor comercial selecciona un archivo de logo de 8 MB
- CUANDO intenta subirlo para la marca "Nike"
- ENTONCES el sistema rechaza el archivo e indica que el tamaño máximo permitido es 5 MB

### Requisito 3: Desactivación y reactivación de marca
El sistema DEBE permitir desactivar (baja lógica) una marca, impidiendo la desactivación si tiene productos activos asociados, y permitir su reactivación posterior.

#### Escenario: Desactivación exitosa de una marca sin productos activos
- DADO que la marca "Wilson" no tiene productos activos asociados
- CUANDO el gestor comercial solicita desactivarla
- ENTONCES el sistema cambia su estado a INACTIVO y deja de mostrarla en los filtros de los canales

#### Escenario: Intento de desactivar una marca con productos activos
- DADO que la marca "Nike" tiene productos activos asociados
- CUANDO el gestor comercial solicita desactivarla
- ENTONCES el sistema rechaza la operación e indica que primero deben desactivarse o reasignarse los productos asociados

#### Escenario: Reactivación exitosa de una marca
- DADO que la marca "Wilson" está INACTIVA
- CUANDO el gestor comercial solicita reactivarla
- ENTONCES el sistema cambia su estado a ACTIVO y vuelve a mostrarla en los filtros de los canales

### Contrato transversal para baja segura de entidades maestras (EDA)

La desactivación de categoría o marca que pueda tener productos asociados es **una operación asíncrona de dos fases funcionales**, no una llamada HTTP entre servicios. Taxonomía registra la operación `PENDING_DEACTIVATION` con `operation_id`, `entity_type`, `entity_id` y `version`, y publica el comando `taxonomy.master.deactivation.check.requested`. Catálogo, en una transacción local, instala una barrera de escritura por entidad (impide crear, activar o reasignar productos a ella mientras dure la operación), revisa todos los productos activos asociados y publica `catalog.master.deactivation.checked` con el mismo `operation_id`, versión y resultado `HAS_ACTIVE_PRODUCTS` o `CLEAR`. La barrera debe participar de las mismas transacciones de escritura de producto para evitar carreras.

Taxonomía **solo confirma la baja lógica tras un resultado `CLEAR` vigente**; si hay productos activos, timeout o error, deja la entidad activa y registra rechazo o estado pendiente recuperable, nunca éxito supuesto. Publica `taxonomy.master.deactivated` o `taxonomy.master.deactivation.rejected`; Catálogo libera la barrera tras procesar idempotentemente ese resultado. La caída de un servicio no autoriza liberar automáticamente una barrera sin reconciliar el estado por `operation_id`. Los consumidores de canales actualizan sus vistas por eventos; durante la propagación no deben prometer visibilidad instantánea global. **No existe transacción distribuida** ni validación HTTP síncrona entre Catálogo y Taxonomía.

La desactivación de una categoría sigue bloqueándose cuando tiene subcategorías activas, comprobación local de Taxonomía. La reactivación vuelve a validar padre y unicidad aplicable según el tipo de entidad. Este protocolo es interno y no presupone contratos confirmados con Ventas y Postventa.

### Requisito 4: Unicidad global y reactivación
El nombre normalizado con `trim` y comparación sin distinción de mayúsculas/minúsculas es único **entre todas las marcas, independientemente de su estado**. Crear o renombrar una marca con nombre reservado por una marca inactiva se rechaza. Reactivar una marca no reutiliza un nombre diferente ni crea un nuevo registro. La unicidad se protege mediante restricción de base de datos, además de validación en aplicación.

## 5. Requisitos no funcionales
- Rendimiento: el listado de marcas activas debe responder en menos de 500 ms.
- Seguridad: solo usuarios con rol "gestor comercial" autenticados pueden crear, actualizar, desactivar o reactivar marcas; la consulta de marcas activas puede ser de acceso público (para los canales).
- Disponibilidad: la consulta de marcas activas se expone vía API al consumidor; la sincronización entre microservicios internos se efectúa mediante eventos asíncronos.
- Auditoría: toda creación o modificación debe registrar automáticamente las fechas created_at y updated_at.
- Integración: la validación de productos activos se realiza mediante la coordinación asíncrona de baja segura. Ante falta de respuesta la operación permanece pendiente o se rechaza, sin desactivar la marca.
- Almacenamiento: el logo debe ser PNG, JPG/JPEG o WebP y no superar 5 MB. SVG no se admite en el alcance inicial.
- Datos maestros: cuando se informe país de origen, debe utilizarse un código ISO 3166-1 válido.

## 6. Fuera de alcance
- Gestión de categorías y características — corresponden a capacidades independientes dentro del mismo sub-módulo.
- Asociación de productos a una marca — es responsabilidad del módulo de Catálogo Core.
- Almacenamiento físico del archivo de logo (se asume un servicio externo de almacenamiento de imágenes; este sub-módulo solo gestiona la URL resultante).

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

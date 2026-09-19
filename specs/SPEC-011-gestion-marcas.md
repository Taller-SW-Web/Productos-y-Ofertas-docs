# SPEC-011 — Especificación: Gestión de marcas

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
El sistema DEBE permitir crear una marca con nombre único, descripción opcional, logo (máximo 5 MB) y país de origen opcional.

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

## 5. Requisitos no funcionales
- Rendimiento: el listado de marcas activas debe responder en menos de 500 ms.
- Seguridad: solo usuarios con rol "gestor comercial" autenticados pueden crear, actualizar, desactivar o reactivar marcas; la consulta de marcas activas puede ser de acceso público (para los canales).
- Disponibilidad: el endpoint de consulta de marcas activas debe estar disponible para los canales de venta de forma asíncrona vía API.
- Auditoría: toda creación o modificación debe registrar automáticamente las fechas created_at y updated_at.
- Integración: la validación de "productos activos asociados" antes de desactivar una marca se resuelve mediante una llamada síncrona al módulo de Catálogo Core, con un timeout de 15 segundos. Si no se recibe respuesta dentro de ese lapso, la desactivación debe rechazarse en lugar de asumir que no existen productos asociados.
- Almacenamiento: el archivo de logo no debe superar los 5 MB.

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

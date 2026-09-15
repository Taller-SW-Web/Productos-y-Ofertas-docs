# Especificación: Gestión de categorías y subcategorías

## 1. Contexto
El Marketplace Multicanal necesita organizar los productos deportivos en una estructura de categorías y subcategorías (por ejemplo, "Calzado" > "Zapatillas de Running") para que los clientes puedan navegar el catálogo, los canales (Marketplace, Chatbot, Retail) puedan filtrar productos, y el módulo de Catálogo Core (a cargo de otro integrante) pueda asociar cada producto a una categoría válida. Esta estructura debe mantenerse de forma centralizada en el sub-módulo de Taxonomía y SEO, ya que ningún otro módulo tiene acceso directo a esta información salvo por API.

## 2. Propósito
Permitir al gestor comercial crear, consultar, actualizar y desactivar categorías y subcategorías del catálogo, garantizando una jerarquía consistente que sirva de base para la navegación de los clientes y la clasificación de productos por parte de otros módulos.

## 3. Alcance
Incluye:
- Creación de categorías y subcategorías (jerarquía de un nivel padre-hijo).
- Consulta de una categoría por ID y listado con filtros y paginación.
- Consulta del árbol jerárquico completo de categorías (padre con sus hijos).
- Actualización de los datos de una categoría existente.
- Desactivación y reactivación de una categoría (baja lógica).
- Exposición de un endpoint de solo lectura para que otros módulos (Catálogo Core, canales) consulten categorías activas.

## 4. Requisitos

### Requisito 1: Creación de categoría
El sistema DEBE permitir crear una categoría con nombre, descripción y, opcionalmente, una categoría padre, generando un slug único de forma automática.

#### Escenario: Creación exitosa de una categoría raíz
- DADO que el gestor comercial está autenticado y no indica categoría padre
- CUANDO envía nombre "Zapatillas" y descripción válida
- ENTONCES el sistema crea la categoría con estado ACTIVO, genera el slug "zapatillas" y la registra sin categoría padre

#### Escenario: Intento de crear una categoría con nombre duplicado
- DADO que ya existe una categoría activa con el nombre "Zapatillas"
- CUANDO el gestor comercial intenta crear otra categoría con el mismo nombre
- ENTONCES el sistema rechaza la operación y devuelve un mensaje indicando que el nombre (o el slug generado) ya existe

### Requisito 2: Asignación de subcategoría a una categoría padre
El sistema DEBE permitir asociar una categoría a otra como su categoría padre, formando una jerarquía de un nivel.

#### Escenario: Creación exitosa de una subcategoría
- DADO que existe la categoría activa "Zapatillas" con id 10
- CUANDO el gestor comercial crea la categoría "Running" indicando categoria_padre_id = 10
- ENTONCES el sistema registra "Running" como subcategoría de "Zapatillas" y esta aparece anidada al consultar el árbol jerárquico

#### Escenario: Intento de asignar una categoría como padre de sí misma
- DADO que existe la categoría "Zapatillas" con id 10
- CUANDO el gestor comercial intenta actualizar la categoría 10 indicando categoria_padre_id = 10
- ENTONCES el sistema rechaza la operación e informa que una categoría no puede ser su propia categoría padre

### Requisito 3: Actualización de categoría
El sistema DEBE permitir modificar el nombre, descripción, orden, imagen y categoría padre de una categoría existente, sin afectar productos ya asociados a ella.

#### Escenario: Actualización exitosa de datos generales
- DADO que existe la categoría "Running" con id 15
- CUANDO el gestor comercial actualiza su descripción y su orden de visualización
- ENTONCES el sistema guarda los cambios y actualiza el campo updated_at

#### Escenario: Intento de actualizar una categoría inexistente
- DADO que no existe ninguna categoría con id 999
- CUANDO el gestor comercial intenta actualizar la categoría con id 999
- ENTONCES el sistema devuelve un error indicando que la categoría no fue encontrada

### Requisito 4: Desactivación de categoría
El sistema DEBE permitir desactivar (baja lógica) una categoría, impidiendo la desactivación si tiene subcategorías activas asociadas.

#### Escenario: Desactivación exitosa de una categoría sin subcategorías
- DADO que la categoría "Running" con id 15 no tiene subcategorías activas
- CUANDO el gestor comercial solicita desactivarla
- ENTONCES el sistema cambia su estado a INACTIVO y deja de mostrarla en las consultas de navegación de los canales

#### Escenario: Intento de desactivar una categoría con subcategorías activas
- DADO que la categoría "Zapatillas" con id 10 tiene la subcategoría activa "Running"
- CUANDO el gestor comercial solicita desactivar la categoría "Zapatillas"
- ENTONCES el sistema rechaza la operación e indica que primero deben desactivarse sus subcategorías

## 5. Requisitos no funcionales
- Rendimiento: la consulta del árbol jerárquico completo debe responder en menos de 1 segundo con hasta 500 categorías registradas.
- Seguridad: solo usuarios con rol "gestor comercial" autenticados pueden crear, actualizar o desactivar categorías; la consulta de categorías activas puede ser de acceso público (para los canales).
- Disponibilidad: el endpoint de consulta de categorías activas debe estar disponible para ser consumido por los canales (Marketplace, Chatbot, Retail) de forma asíncrona vía API.
- Auditoría: toda creación o modificación debe registrar automáticamente las fechas created_at y updated_at.

## 6. Fuera de alcance
- Gestión de marcas y características — corresponde a capacidades independientes dentro del mismo sub-módulo.
- Asociación entre categoría y características aplicables — se define en la capacidad "Asociación categoría-característica".
- Configuración de slugs personalizados y metadatos SEO (meta-título, meta-descripción, keywords) — se define en la capacidad "Gestión de SEO y metadatos".
- Asociación de productos a una categoría — es responsabilidad del módulo de Catálogo Core.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

# Especificación: Asociación entre categorías y características

## 1. Contexto
No todos los productos comparten los mismos atributos: una zapatilla necesita "Talla" y "Color", mientras que un balón necesita "Tamaño" y "Material", pero no "Talla". El módulo de Catálogo Core (a cargo de otro integrante) necesita saber, al momento de registrar un producto, qué características debe solicitar según la categoría elegida. Esta capacidad centraliza esa regla de negocio en el sub-módulo de Taxonomía, evitando que cada canal o módulo defina su propia lógica de qué atributos aplican a cada categoría.

## 2. Propósito
Permitir al gestor comercial definir qué características son aplicables a cada categoría, indicando si son obligatorias u opcionales, de modo que el Catálogo Core pueda construir formularios de producto dinámicos y consistentes por categoría.

## 3. Alcance
Incluye:
- Asociación de una o varias características a una categoría específica.
- Marcado de una característica como obligatoria u opcional dentro de una categoría.
- Desasociación de una característica de una categoría.
- Consulta, para una categoría dada, del listado de características aplicables (con su condición de obligatoriedad).
- Exposición de esta información vía API de solo lectura para el módulo de Catálogo Core.

## 4. Requisitos

### Requisito 1: Asociar característica a categoría
El sistema DEBE permitir asociar una característica existente a una categoría existente, indicando si es obligatoria u opcional.

#### Escenario: Asociación exitosa de una característica obligatoria
- DADO que existen la categoría "Zapatillas" (id 10) y la característica "Talla" (id 3), ambas activas
- CUANDO el gestor comercial asocia la característica 3 a la categoría 10 marcándola como obligatoria
- ENTONCES el sistema registra la asociación y la característica "Talla" aparece como obligatoria al consultar las características de "Zapatillas"

#### Escenario: Intento de asociar una característica ya asociada a la misma categoría
- DADO que la característica "Talla" ya está asociada a la categoría "Zapatillas"
- CUANDO el gestor comercial intenta asociar nuevamente "Talla" a "Zapatillas"
- ENTONCES el sistema rechaza la operación e indica que la asociación ya existe

### Requisito 2: Consultar características aplicables a una categoría
El sistema DEBE exponer, para una categoría dada, el listado de características aplicables junto con su condición de obligatoriedad, para ser consumido por el módulo de Catálogo Core.

#### Escenario: Consulta exitosa de características de una categoría
- DADO que la categoría "Zapatillas" tiene asociadas las características "Talla" (obligatoria) y "Color" (opcional)
- CUANDO el módulo de Catálogo Core solicita las características de la categoría "Zapatillas"
- ENTONCES el sistema devuelve ambas características indicando correctamente cuál es obligatoria y cuál opcional

#### Escenario: Consulta de características de una categoría sin asociaciones
- DADO que la categoría "Accesorios Varios" no tiene ninguna característica asociada
- CUANDO se solicita el listado de características de esa categoría
- ENTONCES el sistema devuelve una lista vacía sin generar error

### Requisito 3: Desasociar característica de categoría
El sistema DEBE permitir eliminar la asociación entre una característica y una categoría cuando ya no sea aplicable.

#### Escenario: Desasociación exitosa
- DADO que la característica "Material" está asociada a la categoría "Balones"
- CUANDO el gestor comercial elimina esa asociación
- ENTONCES el sistema deja de listar "Material" como característica aplicable a "Balones"

#### Escenario: Intento de desasociar una relación inexistente
- DADO que la característica "Talla" nunca fue asociada a la categoría "Balones"
- CUANDO el gestor comercial intenta eliminar esa asociación inexistente
- ENTONCES el sistema devuelve un error indicando que la asociación no existe

## 5. Requisitos no funcionales
- Rendimiento: la consulta de características por categoría debe responder en menos de 500 ms, dado que será invocada frecuentemente por el Catálogo Core al crear productos.
- Seguridad: solo el gestor comercial autenticado puede crear o eliminar asociaciones; la consulta puede exponerse como API interna de solo lectura para otros módulos.
- Disponibilidad: el endpoint de consulta debe estar disponible de forma constante, ya que es una dependencia directa del flujo de creación de productos en otro módulo.
- Consistencia: si una característica o categoría se desactiva, sus asociaciones deben dejar de considerarse activas sin necesidad de eliminarlas físicamente.

## 6. Fuera de alcance
- Creación y edición de categorías — corresponde a la capacidad "Gestión de categorías y subcategorías".
- Creación y edición de características y sus valores — corresponde a la capacidad "Gestión de características".
- Uso de estas asociaciones para validar el formulario real de creación de producto — es responsabilidad del módulo de Catálogo Core.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

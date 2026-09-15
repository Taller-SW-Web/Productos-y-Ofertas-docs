# Especificación: Reglas de Venta Cruzada y Upselling

## 1. Contexto
Como valor agregado del Módulo de Productos y Ofertas, se propone incorporar reglas de venta cruzada y upselling para recomendar productos relacionados a los clientes a través de los distintos canales de venta.

La capacidad se basa en reglas configuradas manualmente por el Gestor Comercial. Por ejemplo, al consultar unas zapatillas, el sistema puede sugerir medias deportivas como venta cruzada o una alternativa superior como upselling.

## 2. Propósito
Permitir al Gestor Comercial configurar relaciones entre productos y permitir que los canales de venta consulten recomendaciones de cross-sell y upselling mediante API.

## 3. Alcance
Incluye:
- Registrar reglas de cross-sell.
- Registrar reglas de upselling.
- Asociar un producto origen con uno o más productos recomendados.
- Definir prioridad de recomendaciones.
- Activar y desactivar reglas.
- Validar vigencia de reglas.
- Consultar recomendaciones mediante API.
- Ordenar recomendaciones según prioridad configurada.

## 4. Requisitos

### Requisito 1: Registrar reglas de cross-sell
El sistema DEBE permitir al Gestor Comercial relacionar un producto origen con uno o más productos complementarios.

#### Escenario: Registro válido de cross-sell
- DADO que existen un producto origen y un producto recomendado diferentes
- CUANDO el Gestor Comercial registra una regla de tipo CROSS_SELL
- ENTONCES el sistema almacena la relación
- Y la deja disponible para futuras consultas

#### Escenario: Producto recomendado igual al producto origen
- DADO que el Gestor Comercial selecciona el mismo producto como origen y recomendado
- CUANDO intenta registrar la regla
- ENTONCES el sistema rechaza el registro
- Y comunica que un producto no puede recomendarse a sí mismo

### Requisito 2: Registrar reglas de upselling
El sistema DEBE permitir al Gestor Comercial relacionar un producto origen con otro producto sugerido como alternativa superior.

#### Escenario: Registro válido de upselling
- DADO que existen un producto origen y un producto recomendado diferentes
- CUANDO el Gestor Comercial registra una regla de tipo UPSELL
- ENTONCES el sistema almacena la relación
- Y la deja disponible para futuras consultas

#### Escenario: Producto inexistente
- DADO que se intenta configurar una regla con un producto inexistente
- CUANDO el sistema valida la relación
- ENTONCES rechaza el registro
- Y comunica que el producto indicado no es válido

### Requisito 3: Definir prioridad de recomendaciones
El sistema DEBE permitir asignar una prioridad a las reglas configuradas.

#### Escenario: Varias recomendaciones válidas
- DADO que existen varias reglas activas y vigentes para un mismo producto
- Y cada regla posee una prioridad
- CUANDO un canal solicita recomendaciones
- ENTONCES el sistema devuelve los productos ordenados según la prioridad definida

#### Escenario: Prioridad inválida
- DADO que el Gestor Comercial intenta registrar una regla con una prioridad inválida
- CUANDO solicita guardar la regla
- ENTONCES el sistema rechaza la configuración
- Y solicita un valor de prioridad válido

### Requisito 4: Activar y desactivar reglas
El sistema DEBE permitir al Gestor Comercial activar o desactivar una regla sin eliminarla.

#### Escenario: Desactivar una regla
- DADO que existe una regla activa
- CUANDO el Gestor Comercial la desactiva
- ENTONCES el sistema cambia su estado a inactivo
- Y deja de considerarla en futuras recomendaciones

#### Escenario: Regla inactiva dentro de vigencia
- DADO que una regla se encuentra dentro de su periodo de vigencia
- Y su estado es inactivo
- CUANDO un canal consulta recomendaciones
- ENTONCES el sistema no devuelve dicha regla

### Requisito 5: Validar vigencia de reglas
El sistema DEBE considerar el periodo de vigencia de cada regla antes de exponerla como recomendación.

#### Escenario: Regla activa y vigente
- DADO que una regla está activa
- Y la fecha actual se encuentra dentro de su periodo de vigencia
- CUANDO un canal consulta recomendaciones para el producto origen
- ENTONCES el sistema incluye el producto relacionado

#### Escenario: Regla vencida
- DADO que una regla tiene una fecha de fin anterior a la fecha actual
- CUANDO un canal consulta recomendaciones
- ENTONCES el sistema no incluye esa regla

### Requisito 6: Consultar recomendaciones por API
El sistema DEBE exponer mediante API las recomendaciones configuradas para ser consumidas por los canales de venta.

#### Escenario: Producto con recomendaciones
- DADO que un producto tiene reglas activas y vigentes
- CUANDO un canal solicita sus recomendaciones
- ENTONCES el sistema devuelve los productos recomendados
- Y devuelve el tipo de recomendación
- Y devuelve la prioridad correspondiente

#### Escenario: Producto sin recomendaciones
- DADO que un producto no posee reglas activas y vigentes
- CUANDO un canal solicita sus recomendaciones
- ENTONCES el sistema responde con una lista vacía
- Y no genera un error

### Requisito 7: Consultar reglas configuradas
El sistema DEBE permitir al Gestor Comercial consultar las reglas de cross-sell y upselling registradas.

#### Escenario: Consulta con reglas existentes
- DADO que existen reglas registradas
- CUANDO el Gestor Comercial accede a la consulta
- ENTONCES el sistema muestra las reglas
- Y muestra su tipo, prioridad, estado y vigencia

#### Escenario: Consulta sin reglas
- DADO que no existen reglas registradas
- CUANDO el Gestor Comercial realiza la consulta
- ENTONCES el sistema muestra una lista vacía
- Y no genera un error

## 5. Requisitos no funcionales
- Rendimiento: La consulta de recomendaciones debe responder en un tiempo adecuado para no afectar perceptiblemente la interacción del cliente.
- Seguridad: Solo usuarios autenticados y autorizados como Gestor Comercial pueden crear, modificar, activar o desactivar reglas.
- Auditoría: El sistema debe conservar información de creación y última modificación de cada regla.
- Integración: Las recomendaciones deben exponerse mediante API para los canales de venta.
- Escalabilidad: La estructura de reglas debe permitir incorporar nuevas relaciones entre productos sin modificar la lógica de los canales consumidores.

## 6. Fuera de alcance
- Recomendaciones mediante inteligencia artificial o aprendizaje automático — esta capacidad se limita a reglas configuradas manualmente.
- Recomendaciones basadas en historial de navegación o compras — no forman parte del alcance inicial.
- Gestión de promociones — se especifica como capacidad independiente.
- Gestión de cupones — se especifica como capacidad independiente.
- Gestión de productos y stock — corresponde a otras funcionalidades del Módulo de Productos y Ofertas.
- Modificación de datos pertenecientes a otros módulos — la integración se realiza mediante APIs.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

# Especificación: Gestión de Ofertas y Promociones

## 1. Contexto
El proyecto consiste en un Marketplace Multicanal para productos deportivos, organizado en módulos integrados mediante APIs. Dentro del Módulo de Productos y Ofertas, una funcionalidad obligatoria es la gestión de ofertas y promociones.

Esta capacidad concentra la lógica necesaria para registrar promociones, validar sus fechas, estado y condiciones, y determinar cuáles son aplicables a los productos consultados por los distintos canales de venta.

## 2. Propósito
Permitir al Gestor Comercial administrar promociones y permitir que los canales de venta consulten cuáles son válidas y aplicables a un producto.

## 3. Alcance
Incluye:
- Registrar promociones.
- Consultar promociones.
- Modificar promociones.
- Activar y desactivar promociones.
- Validar fechas y valores de descuento.
- Asociar promociones a productos.
- Evaluar promociones aplicables.
- Resolver múltiples promociones válidas sobre un mismo producto.

## 4. Requisitos

### Requisito 1: Registrar promociones
El sistema DEBE permitir al Gestor Comercial registrar una promoción indicando como mínimo nombre, tipo de descuento, valor del descuento, fecha de inicio, fecha de fin, estado y productos asociados.

#### Escenario: Registro correcto de una promoción
- DADO que el Gestor Comercial proporciona todos los datos obligatorios
- Y la fecha de inicio es anterior a la fecha de fin
- Y el descuento tiene un valor válido
- CUANDO solicita registrar la promoción
- ENTONCES el sistema registra la promoción
- Y la deja disponible para consulta y evaluación

#### Escenario: Registro con fechas inválidas
- DADO que el Gestor Comercial ingresa una fecha de inicio igual o posterior a la fecha de fin
- CUANDO solicita registrar la promoción
- ENTONCES el sistema rechaza el registro
- Y comunica que el periodo de vigencia es inválido

### Requisito 2: Validar valores de descuento
El sistema DEBE validar que el valor ingresado sea coherente con el tipo de descuento configurado.

#### Escenario: Descuento porcentual válido
- DADO que se configura una promoción de tipo porcentaje
- Y el valor es mayor que 0 y menor o igual que 100
- CUANDO el sistema valida la promoción
- ENTONCES acepta el valor ingresado

#### Escenario: Descuento porcentual inválido
- DADO que se configura una promoción de tipo porcentaje
- Y el valor es menor o igual que 0 o mayor que 100
- CUANDO el sistema valida la promoción
- ENTONCES rechaza el registro o modificación
- Y comunica que el porcentaje no es válido

### Requisito 3: Modificar promociones
El sistema DEBE permitir al Gestor Comercial modificar los datos configurables de una promoción existente.

#### Escenario: Modificación válida
- DADO que existe una promoción registrada
- Y el Gestor Comercial ingresa nuevos datos válidos
- CUANDO solicita guardar los cambios
- ENTONCES el sistema actualiza la promoción

#### Escenario: Modificación con datos inválidos
- DADO que existe una promoción registrada
- Y se ingresan fechas o descuentos inválidos
- CUANDO se solicita guardar los cambios
- ENTONCES el sistema rechaza la modificación
- Y conserva la última configuración válida

### Requisito 4: Activar y desactivar promociones
El sistema DEBE permitir al Gestor Comercial activar o desactivar una promoción sin eliminarla.

#### Escenario: Desactivar promoción
- DADO que existe una promoción activa
- CUANDO el Gestor Comercial la desactiva
- ENTONCES el sistema cambia su estado a inactivo
- Y deja de considerarla en nuevas evaluaciones

#### Escenario: Promoción inactiva dentro de vigencia
- DADO que una promoción está dentro de su periodo de vigencia
- Y su estado es inactivo
- CUANDO un canal consulta promociones aplicables
- ENTONCES el sistema no devuelve dicha promoción

### Requisito 5: Evaluar promociones aplicables
El sistema DEBE determinar las promociones aplicables a un producto considerando asociación, estado y periodo de vigencia.

#### Escenario: Promoción vigente y activa
- DADO que existe una promoción asociada a un producto
- Y está activa
- Y la fecha actual está dentro de su vigencia
- CUANDO un canal consulta las promociones aplicables
- ENTONCES el sistema devuelve la promoción como aplicable

#### Escenario: Promoción vencida
- DADO que existe una promoción asociada a un producto
- Y la fecha actual es posterior a su fecha de fin
- CUANDO un canal consulta las promociones aplicables
- ENTONCES el sistema no devuelve la promoción

### Requisito 6: Resolver múltiples promociones
El sistema DEBE resolver el caso en que más de una promoción sea válida para el mismo producto.

#### Escenario: Dos promociones válidas
- DADO que un producto tiene más de una promoción activa y vigente
- CUANDO el sistema evalúa las promociones aplicables
- ENTONCES selecciona la promoción que genere el mayor beneficio económico para el cliente

#### Escenario: Solo una promoción válida
- DADO que un producto tiene varias promociones asociadas
- Y solo una cumple las condiciones
- CUANDO el sistema evalúa las promociones
- ENTONCES considera únicamente la promoción válida

### Requisito 7: Consultar promociones
El sistema DEBE permitir al Gestor Comercial consultar las promociones registradas con su estado y vigencia.

#### Escenario: Consulta con promociones existentes
- DADO que existen promociones registradas
- CUANDO el Gestor Comercial accede a la consulta
- ENTONCES el sistema muestra las promociones
- Y muestra su estado y fechas de vigencia

#### Escenario: Consulta sin promociones
- DADO que no existen promociones registradas
- CUANDO el Gestor Comercial realiza la consulta
- ENTONCES el sistema muestra una lista vacía
- Y no genera un error

## 5. Requisitos no funcionales
- Rendimiento: Las consultas de promociones aplicables deben responder en un tiempo adecuado para no afectar perceptiblemente la experiencia de los canales.
- Seguridad: Solo usuarios autenticados y autorizados como Gestor Comercial pueden crear, modificar, activar o desactivar promociones.
- Auditoría: El sistema debe conservar información de creación y última modificación de cada promoción.
- Consistencia: La evaluación de fechas debe utilizar una referencia temporal consistente en el backend.
- Integración: La consulta de promociones debe estar disponible mediante API, sin acceso directo de otros módulos a la base de datos.

## 6. Fuera de alcance
- Gestión de cupones — se especifica como capacidad independiente.
- Gestión de venta cruzada y upselling — se especifica como capacidad independiente.
- Gestión de productos — corresponde a otra funcionalidad del módulo.
- Gestión de precios base — corresponde a otra funcionalidad del módulo.
- Gestión de stock — corresponde a otra funcionalidad del módulo.
- Checkout, pedidos y pagos — corresponden a otros módulos y canales.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

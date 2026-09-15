# Especificación: Gestión de Cupones de Descuento

## 1. Contexto
Dentro del Módulo de Productos y Ofertas del Marketplace Multicanal, una de las funcionalidades obligatorias es la gestión de cupones de descuento.

Esta capacidad permite definir códigos promocionales utilizables por los canales de venta y concentra las validaciones necesarias para determinar si un cupón puede aplicarse a una compra según su estado, vigencia y condiciones configuradas.

## 2. Propósito
Permitir al Gestor Comercial administrar cupones de descuento y permitir que los canales de venta validen si un cupón puede aplicarse a una compra.

## 3. Alcance
Incluye:
- Registrar cupones.
- Consultar cupones.
- Modificar cupones.
- Activar y desactivar cupones.
- Validar códigos duplicados.
- Validar fechas de vigencia.
- Validar monto mínimo de compra.
- Validar límites de uso cuando estén configurados.
- Exponer la validación del cupón mediante API.

## 4. Requisitos

### Requisito 1: Registrar cupones
El sistema DEBE permitir al Gestor Comercial registrar un cupón indicando como mínimo código, tipo de descuento, valor, fecha de inicio, fecha de fin, estado y condiciones de uso configuradas.

#### Escenario: Registro correcto de cupón
- DADO que el Gestor Comercial proporciona un código no registrado
- Y define fechas y valores válidos
- CUANDO solicita registrar el cupón
- ENTONCES el sistema crea el cupón
- Y lo deja disponible para validación

#### Escenario: Código duplicado
- DADO que ya existe un cupón con un código determinado
- CUANDO el Gestor Comercial intenta registrar otro cupón con el mismo código
- ENTONCES el sistema rechaza el registro
- Y comunica que el código ya se encuentra en uso

### Requisito 2: Validar vigencia del cupón
El sistema DEBE validar que un cupón se encuentre activo y dentro de su periodo de vigencia antes de aprobar su uso.

#### Escenario: Cupón vigente
- DADO que existe un cupón activo
- Y la fecha actual se encuentra entre su fecha de inicio y fecha de fin
- CUANDO un canal solicita validar el cupón
- ENTONCES el sistema continúa con la validación de sus demás condiciones

#### Escenario: Cupón vencido
- DADO que existe un cupón
- Y la fecha actual es posterior a su fecha de fin
- CUANDO un canal solicita validarlo
- ENTONCES el sistema informa que el cupón no es válido
- Y señala que el motivo es su vencimiento

### Requisito 3: Validar monto mínimo
El sistema DEBE verificar el monto mínimo de compra cuando el cupón tenga esta condición configurada.

#### Escenario: Compra cumple monto mínimo
- DADO que el cupón exige un monto mínimo
- Y la compra alcanza o supera ese monto
- CUANDO el sistema valida el cupón
- ENTONCES considera cumplida la condición de monto mínimo

#### Escenario: Compra no cumple monto mínimo
- DADO que el cupón exige un monto mínimo
- Y la compra es inferior al monto configurado
- CUANDO el sistema valida el cupón
- ENTONCES rechaza su aplicación
- Y comunica que no se cumple el monto mínimo requerido

### Requisito 4: Validar límites de uso
El sistema DEBE verificar que un cupón no haya superado el número máximo de usos configurado.

#### Escenario: Cupón con usos disponibles
- DADO que el cupón tiene un límite máximo de usos
- Y aún no ha alcanzado dicho límite
- CUANDO se solicita validar el cupón
- ENTONCES el sistema considera válida esta condición

#### Escenario: Cupón sin usos disponibles
- DADO que el cupón alcanzó el número máximo de usos permitido
- CUANDO un canal solicita validarlo
- ENTONCES el sistema rechaza su aplicación
- Y comunica que el límite de usos fue alcanzado

### Requisito 5: Activar y desactivar cupones
El sistema DEBE permitir al Gestor Comercial activar o desactivar un cupón sin eliminarlo.

#### Escenario: Desactivar cupón
- DADO que existe un cupón activo
- CUANDO el Gestor Comercial lo desactiva
- ENTONCES el sistema cambia su estado a inactivo
- Y deja de aceptarlo en nuevas validaciones

#### Escenario: Intentar utilizar un cupón inactivo
- DADO que existe un cupón dentro de su vigencia
- Y su estado es inactivo
- CUANDO un canal solicita validarlo
- ENTONCES el sistema informa que el cupón no es válido

### Requisito 6: Modificar cupones
El sistema DEBE permitir al Gestor Comercial modificar la configuración de un cupón existente.

#### Escenario: Modificación válida
- DADO que existe un cupón registrado
- Y el Gestor Comercial ingresa nuevos datos válidos
- CUANDO guarda los cambios
- ENTONCES el sistema actualiza el cupón

#### Escenario: Modificación inválida
- DADO que existe un cupón registrado
- Y se ingresan fechas o valores inválidos
- CUANDO se intenta guardar la modificación
- ENTONCES el sistema rechaza los cambios
- Y conserva la última configuración válida

### Requisito 7: Validar cupón por API
El sistema DEBE exponer mediante API la validación de cupones para ser consumida por los canales de venta.

#### Escenario: Cupón válido
- DADO que el código existe
- Y está activo y vigente
- Y la compra cumple sus condiciones
- CUANDO un canal solicita validarlo
- ENTONCES el sistema informa que el cupón es válido
- Y devuelve el beneficio correspondiente

#### Escenario: Cupón inexistente
- DADO que un canal envía un código que no existe
- CUANDO solicita validarlo
- ENTONCES el sistema informa que el cupón no es válido
- Y señala que el código no fue encontrado

### Requisito 8: Consultar cupones
El sistema DEBE permitir al Gestor Comercial consultar los cupones registrados junto con su estado y periodo de vigencia.

#### Escenario: Consulta con cupones existentes
- DADO que existen cupones registrados
- CUANDO el Gestor Comercial accede a la consulta
- ENTONCES el sistema muestra los cupones disponibles
- Y muestra su estado y fechas de vigencia

#### Escenario: Consulta sin cupones
- DADO que no existen cupones registrados
- CUANDO el Gestor Comercial realiza la consulta
- ENTONCES el sistema muestra una lista vacía
- Y no genera un error

## 5. Requisitos no funcionales
- Rendimiento: La validación de un cupón debe responder en un tiempo adecuado para no retrasar perceptiblemente el proceso de compra.
- Seguridad: Solo usuarios autenticados y autorizados como Gestor Comercial pueden crear, modificar, activar o desactivar cupones.
- Auditoría: El sistema debe conservar información de creación y última modificación de cada cupón.
- Consistencia: La evaluación de fechas debe utilizar una referencia temporal consistente en el backend.
- Integración: La validación de cupones debe exponerse mediante API sin acceso directo de otros módulos a la base de datos.

## 6. Fuera de alcance
- Gestión de ofertas y promociones — se especifica como capacidad independiente.
- Gestión de reglas de venta cruzada y upselling — se especifica como capacidad independiente.
- Procesamiento del pago — corresponde al canal o módulo responsable de ventas.
- Gestión de productos y precios base — corresponde a otras funcionalidades del Módulo de Productos y Ofertas.
- Reembolsos y devoluciones — corresponden al Módulo de Ventas y Postventa.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

# Especificación: Gestión de características y sus valores

## 1. Contexto
Los productos deportivos varían según atributos como color, talla, material o peso. Estos atributos deben definirse de forma centralizada como "características" en el sub-módulo de Taxonomía, para que luego (mediante la capacidad de asociación categoría-característica) se determine a qué categorías aplica cada una, y para que el módulo de Catálogo Core pueda usarlas al definir las variantes/SKUs de un producto (por ejemplo, una zapatilla en talla 40 y color azul).

## 2. Propósito
Permitir al gestor comercial crear y mantener el catálogo de características disponibles (con su tipo de dato) y, cuando corresponda, los valores posibles de cada una, de modo que sirvan como base consistente para clasificar productos y construir sus variantes.

## 3. Alcance
Incluye:
- Creación, consulta, actualización y desactivación de características.
- Definición del tipo de dato de una característica (texto, número o lista de opciones) y su unidad de medida si aplica.
- Gestión de valores posibles para características de tipo lista (agregar, editar, eliminar/desactivar, ordenar).
- Consulta de una característica junto con sus valores disponibles.
- Exposición de esta información vía API para el módulo de Catálogo Core.

## 4. Requisitos

### Requisito 1: Creación de característica
El sistema DEBE permitir crear una característica indicando su nombre, tipo de dato (texto, número o lista) y, si aplica, su unidad de medida.

#### Escenario: Creación exitosa de una característica de tipo lista
- DADO que el gestor comercial está autenticado
- CUANDO crea la característica "Color" con tipo de dato "LISTA"
- ENTONCES el sistema registra la característica con estado ACTIVO y queda disponible para agregarle valores

#### Escenario: Intento de crear una característica numérica sin unidad de medida siendo requerida
- DADO que el gestor comercial crea una característica "Peso" con tipo de dato "NUMERO"
- CUANDO no indica una unidad de medida (ej. "kg" o "g")
- ENTONCES el sistema rechaza la operación e indica que las características numéricas deben especificar una unidad de medida

### Requisito 2: Actualización y desactivación de característica
El sistema DEBE permitir actualizar el nombre o unidad de medida de una característica y desactivarla cuando ya no deba usarse, sin eliminarla físicamente.

#### Escenario: Desactivación exitosa de una característica sin asociaciones activas
- DADO que la característica "Material" no está asociada a ninguna categoría activa
- CUANDO el gestor comercial la desactiva
- ENTONCES el sistema cambia su estado a INACTIVO y deja de ofrecerla para nuevas asociaciones

#### Escenario: Intento de desactivar una característica con asociaciones activas
- DADO que la característica "Talla" está asociada actualmente a la categoría activa "Zapatillas"
- CUANDO el gestor comercial intenta desactivarla
- ENTONCES el sistema rechaza la operación e indica que primero debe eliminarse su asociación con las categorías activas

### Requisito 3: Gestión de valores para características de tipo lista
El sistema DEBE permitir agregar, editar, eliminar/desactivar y ordenar los valores posibles de una característica cuyo tipo de dato sea "LISTA".

#### Escenario: Agregar valores a una característica de tipo lista
- DADO que existe la característica "Talla" con tipo de dato "LISTA" y sin valores registrados
- CUANDO el gestor comercial agrega los valores "S", "M", "L" y "XL" en ese orden
- ENTONCES el sistema los registra asociados a "Talla" y los devuelve en el orden definido al consultarlos

#### Escenario: Intento de agregar un valor duplicado a la misma característica
- DADO que la característica "Color" ya tiene registrado el valor "Rojo"
- CUANDO el gestor comercial intenta agregar nuevamente el valor "Rojo" a la misma característica
- ENTONCES el sistema rechaza la operación indicando que el valor ya existe para esa característica

### Requisito 4: Consulta de característica con sus valores
El sistema DEBE permitir consultar una característica junto con la lista de sus valores posibles (si su tipo de dato es "LISTA"), para ser usada por el módulo de Catálogo Core al definir variantes de producto.

#### Escenario: Consulta exitosa de una característica tipo lista con sus valores
- DADO que la característica "Color" tiene los valores "Rojo", "Azul" y "Negro" activos
- CUANDO el módulo de Catálogo Core consulta la característica "Color"
- ENTONCES el sistema retorna la característica junto con sus tres valores activos, ordenados según su campo de orden

#### Escenario: Consulta de una característica de tipo texto o número
- DADO que la característica "Peso" tiene tipo de dato "NUMERO" y unidad "kg"
- CUANDO se consulta esta característica
- ENTONCES el sistema retorna sus datos sin una lista de valores, indicando que no aplica para este tipo de dato

## 5. Requisitos no funcionales
- Rendimiento: la consulta de una característica con sus valores debe responder en menos de 500 ms, dado que será usada frecuentemente al construir variantes de producto.
- Seguridad: solo el gestor comercial autenticado puede crear, editar, desactivar características o gestionar sus valores; la consulta puede exponerse como API interna de solo lectura.
- Consistencia: los valores de una característica desactivada no deben eliminarse físicamente, para no romper el historial de productos que ya los usan.
- Escalabilidad: el modelo debe soportar características con un número variable de valores (desde 2-3 hasta más de 20, como en el caso de tallas numéricas de calzado).

## 6. Fuera de alcance
- Asociación de características a categorías específicas — corresponde a la capacidad "Asociación entre categorías y características".
- Uso de las características para construir variantes/SKUs reales de un producto — es responsabilidad del módulo de Catálogo Core (Gabriel).
- Validación de qué valor de característica corresponde a qué producto específico — fuera del alcance de este sub-módulo.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

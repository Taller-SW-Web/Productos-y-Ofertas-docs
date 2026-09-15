**Como** **gestor comercial**,

**quiero** definir las características (atributos) de los productos y sus valores posibles

**para** contar con un catálogo consistente de atributos como color, talla o material, que sirva de base para clasificar productos y construir sus variantes.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir crear una característica indicando nombre y tipo de dato (texto, número o lista de opciones). |
| **CA-02** | Si el tipo de dato es "número", el sistema debe exigir una unidad de medida (ej. kg, cm). |
| **CA-03** | El sistema debe permitir actualizar el nombre o unidad de medida de una característica existente. |
| **CA-04** | El sistema debe permitir desactivar una característica, impidiendo la desactivación si tiene asociaciones activas con alguna categoría. |
| **CA-05** | Para características de tipo "lista", el sistema debe permitir agregar, editar, eliminar/desactivar y ordenar sus valores posibles. |
| **CA-06** | El sistema no debe permitir valores duplicados dentro de una misma característica. |
| **CA-07** | El sistema debe exponer una consulta de la característica junto con sus valores activos, ordenados, para su uso por el módulo de Catálogo Core. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de una característica de tipo lista**

* **DADO** que el gestor comercial está autenticado,
* **CUANDO** crea la característica "Color" con tipo de dato "LISTA",
* **ENTONCES** el sistema registra la característica con estado ACTIVO y queda disponible para agregarle valores.

**Escenario 2: Intento de crear una característica numérica sin unidad de medida**

* **DADO** que el gestor comercial crea una característica "Peso" con tipo de dato "NUMERO",
* **CUANDO** no indica una unidad de medida,
* **ENTONCES** el sistema rechaza la operación e indica que las características numéricas deben especificar una unidad de medida.

**Escenario 3: Agregar valores a una característica de tipo lista**

* **DADO** que existe la característica "Talla" con tipo de dato "LISTA" y sin valores registrados,
* **CUANDO** el gestor comercial agrega los valores "S", "M", "L" y "XL" en ese orden,
* **ENTONCES** el sistema los registra asociados a "Talla" y los devuelve en el orden definido al consultarlos.

**Escenario 4: Intento de agregar un valor duplicado a la misma característica**

* **DADO** que la característica "Color" ya tiene registrado el valor "Rojo",
* **CUANDO** el gestor comercial intenta agregar nuevamente el valor "Rojo" a la misma característica,
* **ENTONCES** el sistema rechaza la operación indicando que el valor ya existe para esa característica.

**Escenario 5: Intento de desactivar una característica con asociaciones activas**

* **DADO** que la característica "Talla" está asociada actualmente a la categoría activa "Zapatillas",
* **CUANDO** el gestor comercial intenta desactivarla,
* **ENTONCES** el sistema rechaza la operación e indica que primero debe eliminarse su asociación con las categorías activas.

**Escenario 6: Consulta exitosa de una característica tipo lista con sus valores**

* **DADO** que la característica "Color" tiene los valores "Rojo", "Azul" y "Negro" activos,
* **CUANDO** el módulo de Catálogo Core consulta la característica "Color",
* **ENTONCES** el sistema retorna la característica junto con sus tres valores activos, ordenados según su campo de orden.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Seguridad y Usuarios** | Verificar que quien crea, edita o desactiva características tenga el rol de gestor comercial. | Identidad del usuario, token de sesión, roles y permisos. | Solicitudes de validación de permisos para las operaciones de escritura. |
| **Catálogo Core (Productos)** | Consultar características y sus valores al construir variantes/SKUs de un producto (ej. talla y color). | (No hay interacción directa; solo consume el resultado). | Listado de características activas con sus valores disponibles, vía API. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Asociación entre categorías y características** | Identificador de la característica, para vincularla a las categorías donde sea aplicable. |
| **Carga y Exportación Masiva (Excel/CSV)** | Nombres/identificadores de características y valores declarados en el archivo, para validar su existencia antes de vincularlos a un producto. |

## Reglas pendientes de acordar

* **Máximo de valores por característica:** ¿existe un límite de valores permitidos por característica (ej. tallas numéricas extensas de calzado)?
* **Edición de un valor en uso:** si un valor de característica (ej. "Rojo") ya está siendo usado por productos existentes, ¿se permite renombrarlo o solo desactivarlo y crear uno nuevo?
* **Tipo de dato "texto" y "número":** ¿requieren alguna validación adicional de formato (ej. rango numérico permitido) o solo se registran como libres?

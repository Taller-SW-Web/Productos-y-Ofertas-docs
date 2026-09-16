**Como** **gestor comercial**,

**quiero** definir las características (atributos) de los productos y sus valores posibles

**para** contar con un catálogo consistente de atributos como color, talla o material, que sirva de base para clasificar productos y construir sus variantes.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir crear una característica indicando nombre y tipo de dato (texto, número o lista de opciones). El nombre de la característica debe ser único. |
| **CA-02** | Si el tipo de dato es "número", el sistema debe exigir una unidad de medida (ej. kg, cm) y solo debe aceptar valores numéricos válidos para esa característica en el resto del sistema. |
| **CA-03** | Si el tipo de dato es "texto", el sistema debe limitar el valor libre a un máximo de 100 caracteres. |
| **CA-04** | El sistema debe permitir actualizar el nombre o unidad de medida de una característica existente. No se debe permitir cambiar el tipo de dato de una característica que ya tenga valores o asociaciones activas, para no invalidar datos existentes. |
| **CA-05** | El sistema debe permitir desactivar una característica, impidiendo la desactivación si tiene asociaciones activas con alguna categoría. |
| **CA-06** | Para características de tipo "lista", el sistema debe permitir agregar, editar, eliminar/desactivar y ordenar sus valores posibles. |
| **CA-07** | El sistema no debe permitir valores duplicados dentro de una misma característica. |
| **CA-08** | El sistema debe permitir un máximo de 50 valores activos por característica de tipo "lista"; al alcanzar el límite, debe advertir al gestor comercial antes de bloquear la creación de nuevos valores. |
| **CA-09** | El sistema debe exponer una consulta de la característica junto con sus valores activos, ordenados, para su uso por el módulo de Catálogo Core. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de una característica de tipo lista**

* **DADO** que el gestor comercial está autenticado,
* **CUANDO** crea la característica "Color" con tipo de dato "LISTA",
* **ENTONCES** el sistema registra la característica con estado ACTIVO y queda disponible para agregarle valores.

**Escenario 2: Intento de crear una característica numérica sin unidad de medida**

* **DADO** que el gestor comercial crea una característica "Peso" con tipo de dato "NUMERO",
* **CUANDO** no indica una unidad de medida,
* **ENTONCES** el sistema rechaza la operación e indica que las características numéricas deben especificar una unidad de medida.

**Escenario 3: Intento de cambiar el tipo de dato de una característica en uso**

* **DADO** que la característica "Color" (tipo LISTA) ya tiene valores registrados y está asociada a categorías activas,
* **CUANDO** el gestor comercial intenta cambiar su tipo de dato a "TEXTO",
* **ENTONCES** el sistema rechaza la operación e indica que no se puede cambiar el tipo de dato de una característica en uso.

**Escenario 4: Agregar valores a una característica de tipo lista**

* **DADO** que existe la característica "Talla" con tipo de dato "LISTA" y sin valores registrados,
* **CUANDO** el gestor comercial agrega los valores "S", "M", "L" y "XL" en ese orden,
* **ENTONCES** el sistema los registra asociados a "Talla" y los devuelve en el orden definido al consultarlos.

**Escenario 5: Intento de agregar un valor duplicado a la misma característica**

* **DADO** que la característica "Color" ya tiene registrado el valor "Rojo",
* **CUANDO** el gestor comercial intenta agregar nuevamente el valor "Rojo" a la misma característica,
* **ENTONCES** el sistema rechaza la operación indicando que el valor ya existe para esa característica.

**Escenario 6: Intento de exceder el máximo de valores permitidos**

* **DADO** que la característica "Talla" ya tiene 50 valores activos registrados,
* **CUANDO** el gestor comercial intenta agregar un valor número 51,
* **ENTONCES** el sistema rechaza la operación e indica que se alcanzó el máximo de 50 valores activos por característica.

**Escenario 7: Intento de desactivar una característica con asociaciones activas**

* **DADO** que la característica "Talla" está asociada actualmente a la categoría activa "Zapatillas",
* **CUANDO** el gestor comercial intenta desactivarla,
* **ENTONCES** el sistema rechaza la operación e indica que primero debe eliminarse su asociación con las categorías activas.

**Escenario 8: Consulta exitosa de una característica tipo lista con sus valores**

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

## Reglas resueltas (antes pendientes)

* **Máximo de valores por característica:** 50 valores activos por característica de tipo lista.
* **Validaciones por tipo de dato:** texto limitado a 100 caracteres; número exige unidad de medida y solo acepta valores numéricos.
* **Edición de un valor en uso:** se permite renombrar un valor existente (ej. corregir "Rojo" a "Rojo Intenso"); no se elimina físicamente si está en uso, solo se desactiva.

## Reglas pendientes de acordar

* **Rango numérico:** para características de tipo "número" (ej. Peso), ¿se debe permitir configurar un rango mínimo/máximo válido (ej. 0.1 kg - 50 kg)?

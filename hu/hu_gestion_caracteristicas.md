**Como** **gestor comercial**,

**quiero** administrar características, asociarlas a categorías y gestionar marcas

**para** contar con un catálogo de atributos estandarizado.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe limitar los valores de tipo `TEXTO` a 100 caracteres máximo. |
| **CA-02** | Para tipo `NUMERO`, se exige unidad de medida y validación estricta de formato numérico. |
| **CA-03** | El sistema debe limitar a un máximo de 50 valores activos por característica tipo `LISTA`. |
| **CA-04** | Al renombrar un valor de característica en uso, este debe actualizarse por ID (afectando visualmente a productos existentes sin romper data). |
| **CA-05 (Marcas)** | El sistema debe tener un CRUD completo de Marcas: crear, consultar, actualizar y activar/desactivar. |
| **CA-06 (Marcas)** | Al crear o editar una Marca, se debe validar la unicidad del nombre (ignorando mayúsculas/minúsculas) para evitar marcas duplicadas. |
| **CA-07 (Asociación)** | Las características asignadas a una categoría padre se heredan automáticamente a sus subcategorías. |
| **CA-08 (Asociación)** | Existe un límite máximo de 20 características que pueden asociarse a una misma categoría. |
| **CA-09 (Asociación)** | Si una característica asociada cambia de opcional a obligatoria, los productos preexistentes mantendrán su estado válido hasta que el producto vuelva a ser editado. |

## Escenarios dado-cuando-entonces

**Escenario 1: Límite de características por categoría**
* **DADO** que la categoría "Zapatillas" ya tiene 20 características asociadas,
* **CUANDO** el gestor intenta asociar una nueva característica,
* **ENTONCES** el sistema rechaza la asociación por límite excedido.

**Escenario 2: Herencia a subcategorías**
* **DADO** que "Talla" se asocia al padre "Calzado",
* **CUANDO** se crea un producto en la subcategoría "Zapatillas",
* **ENTONCES** el sistema exige/muestra "Talla" por herencia.

**Escenario 3: Cambio de Opcional a Obligatoria**
* **DADO** que "Color" pasa a ser requerida en una categoría,
* **CUANDO** se consulta un producto viejo sin color,
* **ENTONCES** se muestra normal, pero al intentar actualizar sus datos el sistema bloqueará el guardado hasta que se asigne el color.

**Escenario 4: Módulo Marcas - Duplicidad**
* **DADO** que existe la marca "Nike",
* **CUANDO** se intenta crear "NIKE" o "nike",
* **ENTONCES** el sistema rechaza por duplicidad.

## Reglas resueltas (antes pendientes)
* **Límites de características:** Formalizados a 50 (lista) y 100 chars (texto). Renombre opera por ID.
* **Módulo de Marcas:** Se incluye su CRUD oficial con validación de unicidad y baja lógica.
* **Asociación y Herencia:** Herencia activa, máximo 20 por categoría, los productos legacy no se rompen masivamente al cambiar la obligatoriedad.
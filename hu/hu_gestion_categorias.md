**Como** **gestor comercial**,

**quiero** crear, organizar y mantener las categorías y subcategorías del catálogo

**para** que los clientes y canales de venta puedan navegar y filtrar los productos correctamente.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir crear una categoría con nombre y descripción, indicando opcionalmente una categoría padre. El nombre NO necesita ser único. |
| **CA-02** | La jerarquía se limita a un máximo de 2 niveles: categoría raíz y subcategoría. |
| **CA-03** | El sistema no debe permitir que una categoría se asigne como su propia categoría padre (referencia circular). |
| **CA-04** | El sistema debe incluir explícitamente el campo `categoria_padre_id` entre los campos editables al actualizar (junto con nombre, descripción, orden e imagen), sin afectar productos ya asociados. |
| **CA-05** | Al cambiar el `categoria_padre_id`, el sistema debe validar que el nuevo padre esté activo y que no se superen los 2 niveles de jerarquía. |
| **CA-06** | El sistema debe permitir desactivar (baja lógica) una categoría, validando mediante llamada síncrona que no existan productos activos asociados. |
| **CA-07** | El sistema debe permitir reactivar una categoría previamente desactivada, exigiendo que su categoría padre (si la tuviese) esté en estado activo. |
| **CA-08** | El sistema NUNCA debe eliminar físicamente una categoría; toda baja es lógica. |
| **CA-09** | El sistema debe exponer el árbol jerárquico completo para canales externos. |

## Escenarios dado-cuando-entonces

**Escenario 1: Actualización del campo `categoria_padre_id`**
* **DADO** que existe una subcategoría "Accesorios" y una categoría raíz "Fútbol",
* **CUANDO** el gestor actualiza la subcategoría asignando el `categoria_padre_id` de "Fútbol",
* **ENTONCES** el sistema cambia su ubicación en el árbol respetando el máximo de 2 niveles.

**Escenario 2: Reactivación de categoría con padre inactivo**
* **DADO** que la categoría "Running" (hija) y "Zapatillas" (padre) están inactivas,
* **CUANDO** el gestor solicita reactivar "Running",
* **ENTONCES** el sistema arroja un error requiriendo reactivar primero la categoría padre.

**Escenario 3: Baja lógica y productos**
* **DADO** que una categoría tiene al menos un producto activo,
* **CUANDO** se intenta desactivar,
* **ENTONCES** se bloquea la acción para no dejar productos huérfanos en canales de venta.

## Reglas resueltas (formalizadas)
* **Categoría padre editable:** Se confirma que `categoria_padre_id` se mantiene como campo editable en CA-04.
* **Reactivación:** Alineado completamente con la especificación (Escenario 2).
* **Reglas abiertas:** Se definió oficialmente 2 niveles máximos, validación síncrona bloqueante con Catálogo Core para productos, y prohibición absoluta de eliminación física.
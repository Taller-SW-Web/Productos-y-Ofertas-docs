**Como** **gestor comercial**,

**quiero** configurar el slug y los metadatos SEO (meta-título, meta-descripción, palabras clave) de cada categoría

**para** mejorar el posicionamiento en buscadores de las páginas de categoría del canal Marketplace.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe generar automáticamente un slug normalizado (minúsculas, sin tildes ni caracteres especiales) a partir del nombre de la categoría, cuando esta se crea sin un slug indicado. |
| **CA-02** | Si el slug generado ya existe, el sistema debe generar uno alternativo único (ej. agregando un sufijo numérico) en lugar de duplicarlo. |
| **CA-03** | El sistema debe permitir la edición manual del slug, validando que el nuevo valor sea único y tenga un formato válido. |
| **CA-04** | El sistema debe permitir configurar meta-título, meta-descripción y palabras clave por categoría. |
| **CA-05** | El sistema debe advertir (sin bloquear el guardado) cuando el meta-título o la meta-descripción excedan la longitud recomendada (70 y 160 caracteres respectivamente). |
| **CA-06** | El sistema debe exponer un endpoint que retorne el slug y los metadatos SEO de una categoría activa, consultable por su slug, para uso del canal Marketplace. |
| **CA-07** | El sistema debe rechazar la consulta de metadatos de una categoría inactiva, indicando que no está disponible. |

## Escenarios dado-cuando-entonces

**Escenario 1: Generación exitosa de slug a partir del nombre**

* **DADO** que el gestor comercial crea la categoría con nombre "Zapatillas de Running",
* **CUANDO** el sistema genera el slug automáticamente,
* **ENTONCES** el slug resultante es "zapatillas-de-running", en minúsculas, sin tildes y sin caracteres especiales.

**Escenario 2: Generación de slug con nombre duplicado**

* **DADO** que ya existe una categoría con slug "zapatillas-de-running",
* **CUANDO** se crea una nueva categoría con el mismo nombre "Zapatillas de Running",
* **ENTONCES** el sistema genera un slug alternativo único (por ejemplo, "zapatillas-de-running-2") en lugar de duplicar el existente.

**Escenario 3: Edición exitosa de slug**

* **DADO** que la categoría "Running" tiene el slug "running",
* **CUANDO** el gestor comercial lo actualiza a "zapatillas-running",
* **ENTONCES** el sistema guarda el nuevo slug siempre que no esté en uso por otra categoría.

**Escenario 4: Intento de asignar un slug ya utilizado por otra categoría**

* **DADO** que la categoría "Fútbol" ya usa el slug "futbol",
* **CUANDO** el gestor comercial intenta asignar el slug "futbol" a la categoría "Balones",
* **ENTONCES** el sistema rechaza el cambio e indica que el slug ya está en uso.

**Escenario 5: Meta-descripción que excede la longitud recomendada**

* **DADO** que el gestor comercial ingresa una meta-descripción de 200 caracteres,
* **CUANDO** intenta guardar los cambios,
* **ENTONCES** el sistema permite el guardado pero muestra una advertencia indicando que excede los 160 caracteres recomendados para buscadores.

**Escenario 6: Consulta exitosa de metadatos por slug**

* **DADO** que existe la categoría activa "Running" con slug "zapatillas-running" y metadatos configurados,
* **CUANDO** el canal Marketplace solicita la información de la categoría mediante su slug,
* **ENTONCES** el sistema retorna el nombre, meta-título, meta-descripción y palabras clave de la categoría.

**Escenario 7: Consulta de metadatos de una categoría inactiva**

* **DADO** que la categoría "Descontinuados" tiene estado INACTIVO,
* **CUANDO** el canal Marketplace solicita su información mediante el slug,
* **ENTONCES** el sistema retorna un error indicando que la categoría no está disponible.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Seguridad y Usuarios** | Verificar que quien edita slugs y metadatos tenga el rol de gestor comercial. | Identidad del usuario, token de sesión, roles y permisos. | Solicitudes de validación de permisos para las operaciones de escritura. |
| **Marketplace Cliente** | Obtener el slug y los metadatos SEO de una categoría para renderizar su página y optimizar el posicionamiento en buscadores. | Slug de la categoría solicitada. | Nombre, meta-título, meta-descripción y palabras clave de la categoría activa. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Gestión de categorías y subcategorías** | Identificador, nombre y estado (activo/inactivo) de la categoría sobre la cual se configuran el slug y los metadatos. |

## Reglas pendientes de acordar

* **Formato del sufijo de slug duplicado:** ¿el sufijo será numérico secuencial ("-2", "-3"...) o se usará otro criterio (ej. id de la categoría)?
* **Longitud máxima de palabras clave:** ¿existe un número máximo de palabras clave permitidas por categoría, o un límite de caracteres para el campo completo?
* **Historial de slugs:** si se cambia el slug de una categoría ya indexada por buscadores, ¿el sistema debe mantener una redirección desde el slug anterior o se pierde ese enlace?

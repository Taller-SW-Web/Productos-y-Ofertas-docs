**Como** **gestor comercial**,

**quiero** configurar el slug y los metadatos SEO (meta-título, meta-descripción) de cada categoría

**para** mejorar el posicionamiento en buscadores del Marketplace.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe generar automáticamente un slug normalizado (minúsculas, sin tildes/espacios) al crear una categoría. |
| **CA-02** | **Política de duplicado (Creación):** Si al crear, el slug generado ya existe, el sistema autogenera un sufijo numérico incremental (ej. `slug-2`). |
| **CA-03** | **Política de duplicado (Edición Manual):** Si al editar manualmente, el gestor ingresa un slug ya existente en otra categoría, el sistema debe rechazar el guardado con un error explícito. |
| **CA-04** | **Límites de caracteres:** El sistema debe advertir si el meta-título excede los **70 caracteres** o si la meta-descripción excede los **160 caracteres**. |
| **CA-05** | **Historial y Redirección:** Al modificar un slug preexistente, el sistema debe mantener un historial y generar una redirección 301 del slug antiguo al nuevo. |
| **CA-06** | El sistema expone un endpoint público que retorne los metadatos SEO por slug activo. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación automática con duplicado**
* **DADO** que ya existe el slug "futbol",
* **CUANDO** el gestor crea una nueva categoría llamada "Fútbol" sin proveer slug,
* **ENTONCES** el sistema lo guarda como "futbol-2" automáticamente.

**Escenario 2: Edición manual con duplicado**
* **DADO** que existe el slug "futbol",
* **CUANDO** el gestor intenta renombrar otra categoría manualmente a "futbol",
* **ENTONCES** el sistema arroja error: "El slug indicado ya está en uso".

**Escenario 3: Límites SEO unificados**
* **DADO** un meta-título de 75 caracteres y descripción de 170,
* **CUANDO** se intentan guardar,
* **ENTONCES** se permite el guardado, pero saltan advertencias indicando que se superaron los límites recomendados de 70 y 160 respectivamente.

**Escenario 4: Redirección 301 (Historial)**
* **DADO** un cambio de slug de "zapatillas" a "zapatillas-deportivas",
* **CUANDO** un usuario entra al slug viejo "zapatillas",
* **ENTONCES** es redirigido mediante un 301 a "zapatillas-deportivas".

## Reglas resueltas (antes pendientes)
* **Límites de caracteres unificados:** Confirmado en 70 para títulos y 160 para descripciones en todos los documentos.
* **Historial de slugs:** Resuelto positivamente. Se requiere redirección 301 para evitar pérdidas de posicionamiento SEO.
* **Política ante slug duplicado:** Completamente separada para resolver la ambigüedad: autogenerar con sufijo en la creación, rechazar con error en edición manual.
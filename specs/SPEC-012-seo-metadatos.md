# SPEC-012 — Especificación: Gestión de SEO y metadatos

**Responsable:** Leonardo Lopez  
**Rama:** lopez  
**Trazabilidad:** HU [HU-012](../hu/HU-012-seo-metadatos.md) | Wireframe [WF-012](../wireframes/flows/WF-012-seo-metadatos.md)

## 1. Contexto
Cada categoría necesita un slug y metadatos unificados (título, descripción) para garantizar la optimización en motores de búsqueda (SEO).

## 2. Propósito
Permitir al gestor comercial configurar el slug, registrar su historial y exponer la resolución de redirecciones para que el canal Marketplace ejecute la respuesta HTTP correspondiente, además de advertir sobre longitudes recomendadas de metadatos SEO.

## 3. Alcance
- Generación automática y edición manual de slug.
- Historial de slugs y resolución `old_slug -> new_slug`; la ejecución HTTP 301 pertenece al canal Marketplace que sirve las URLs públicas.
- Política única de duplicados.
- Límites de caracteres estrictos recomendados: 70 y 160.
- Endpoint público de solo lectura para consultar metadatos SEO por slug activo.

## 4. Requisitos

### Requisito 1: Límites de caracteres para Metadatos
El sistema DEBE aplicar límites unificados y recomendados de caracteres para SEO:
- **Meta-título:** Recomendado y advertido a los **70 caracteres**.
- **Meta-descripción:** Recomendado y advertido a los **160 caracteres**.

### Requisito 2: Política unificada ante slug duplicado
Ambos triggers del sistema deben comportarse de la siguiente manera ante colisiones de slugs:
1. **Creación (Automática):** El sistema puede autogenerar un sufijo incremental (ej. `zapatillas-2`) para resolver la colisión, pero DEBE devolver y mostrar al gestor el slug final antes de que la categoría se considere publicada; no se oculta el cambio de URL.
2. **Edición (Manual):** El sistema RECHAZA el duplicado con un error visible en pantalla, exigiendo al gestor que ingrese un valor distinto. No autogenera sufijos en la edición manual.

### Requisito 3: Historial de slugs y resolución de redirecciones
Si el gestor modifica el slug de una categoría ya existente e indexada, Productos y Ofertas DEBE guardar el slug anterior y exponer una resolución permanente `old_slug -> new_slug`. Este servicio **no responde por sí mismo a la navegación pública del cliente**; Marketplace consulta o replica esa resolución y es quien devuelve HTTP `301 Moved Permanently` en su propia capa web.

#### Escenario: Historial de slugs
- DADO que se cambia el slug de "running-antiguo" a "running-nuevo"
- CUANDO Marketplace consulta la resolución de "running-antiguo"
- ENTONCES Productos y Ofertas devuelve que el slug fue reemplazado permanentemente por "running-nuevo" y Marketplace ejecuta la respuesta HTTP 301 al cliente

### Requisito 4: Endpoint público de metadatos por slug activo
El sistema DEBE exponer un endpoint público de solo lectura que, dado un slug activo de categoría, retorne como mínimo el meta-título y la meta-descripción vigentes. El endpoint no requiere autenticación para lectura, no permite modificaciones y no devuelve metadatos de una categoría inactiva como si estuviera publicada.

#### Escenario: Consulta pública por slug activo
- DADO que existe una categoría activa con slug `futbol` y metadatos SEO configurados
- CUANDO un canal consulta el endpoint público usando el slug `futbol`
- ENTONCES el sistema retorna los metadatos SEO vigentes de esa categoría sin permitir operaciones de escritura

## 5. Criterio de completitud
La capacidad cumple si las recomendaciones 70/160 se advierten, el historial y la resolución permanente de slugs funcionan, la creación muestra cualquier sufijo autogenerado, la edición manual rechaza colisiones y el endpoint de solo lectura retorna metadatos por slug activo; la ejecución HTTP 301 queda en Marketplace.

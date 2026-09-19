# SPEC-012 — Especificación: Gestión de SEO y metadatos

## 1. Contexto
Cada categoría necesita un slug y metadatos unificados (título, descripción) para garantizar la optimización en motores de búsqueda (SEO).

## 2. Propósito
Permitir al gestor comercial configurar el slug (con control de duplicados y redirecciones) y validar las longitudes exactas de metadatos SEO.

## 3. Alcance
- Generación automática y edición manual de slug.
- Historial de slugs (Redirección 301).
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
1. **Creación (Automática):** El sistema autogenera un sufijo incremental (ej. `zapatillas-2`) de forma silenciosa para asegurar la creación de la categoría.
2. **Edición (Manual):** El sistema RECHAZA el duplicado con un error visible en pantalla, exigiendo al gestor que ingrese un valor distinto. No autogenera sufijos en la edición manual.

### Requisito 3: Historial de slugs y redirecciones
Si el gestor modifica el slug de una categoría ya existente e indexada, el sistema DEBE guardar en el historial el slug anterior y mantener una redirección 301 (Moved Permanently) hacia el nuevo slug para no perder el posicionamiento previo.

#### Escenario: Historial de slugs
- DADO que se cambia el slug de "running-antiguo" a "running-nuevo"
- CUANDO el canal Marketplace recibe una petición a "running-antiguo"
- ENTONCES el sistema devuelve una redirección 301 indicando la nueva ruta "running-nuevo"

### Requisito 4: Endpoint público de metadatos por slug activo
El sistema DEBE exponer un endpoint público de solo lectura que, dado un slug activo de categoría, retorne como mínimo el meta-título y la meta-descripción vigentes. El endpoint no requiere autenticación para lectura, no permite modificaciones y no devuelve metadatos de una categoría inactiva como si estuviera publicada.

#### Escenario: Consulta pública por slug activo
- DADO que existe una categoría activa con slug `futbol` y metadatos SEO configurados
- CUANDO un canal consulta el endpoint público usando el slug `futbol`
- ENTONCES el sistema retorna los metadatos SEO vigentes de esa categoría sin permitir operaciones de escritura

## 5. Criterio de completitud
La capacidad cumple si los límites (70/160) se validan, las redirecciones 301 operan correctamente, la política de duplicidad (Autogenerar sufijo en creación VS Error en edición) se respeta y el endpoint público de solo lectura retorna los metadatos por slug activo.

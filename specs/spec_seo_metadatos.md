# Especificación: Gestión de SEO y metadatos

## 1. Contexto
Para que las páginas de categoría del canal Marketplace tengan buen posicionamiento en buscadores, cada categoría necesita una URL amigable (slug) y metadatos como título, descripción y palabras clave optimizados. Sin esta capacidad, las categorías solo tendrían identificadores numéricos y no información optimizada para SEO, afectando la visibilidad del Marketplace en motores de búsqueda.

## 2. Propósito
Permitir al gestor comercial configurar y mantener el slug y los metadatos SEO (meta-título, meta-descripción, palabras clave) de cada categoría, y exponer esa información al canal Marketplace para que la use al renderizar sus páginas.

## 3. Alcance
Incluye:
- Generación automática de un slug a partir del nombre de la categoría al crearla.
- Edición manual del slug por parte del gestor comercial.
- Validación de unicidad y formato del slug.
- Configuración de meta-título, meta-descripción y palabras clave por categoría.
- Validación de longitud recomendada de los campos SEO.
- Exposición de esta información vía API para el canal Marketplace.

## 4. Requisitos

### Requisito 1: Generación automática de slug
El sistema DEBE generar automáticamente un slug normalizado a partir del nombre de la categoría cuando esta se crea sin un slug indicado explícitamente.

#### Escenario: Generación exitosa de slug a partir del nombre
- DADO que el gestor comercial crea la categoría con nombre "Zapatillas de Running"
- CUANDO el sistema genera el slug automáticamente
- ENTONCES el slug resultante es "zapatillas-de-running", en minúsculas, sin tildes y sin caracteres especiales

#### Escenario: Generación de slug con nombre duplicado
- DADO que ya existe una categoría con slug "zapatillas-de-running"
- CUANDO se crea una nueva categoría con el mismo nombre "Zapatillas de Running"
- ENTONCES el sistema genera un slug alternativo único (por ejemplo, agregando un sufijo numérico "zapatillas-de-running-2") en lugar de duplicar el existente

### Requisito 2: Edición manual de slug
El sistema DEBE permitir al gestor comercial modificar manualmente el slug de una categoría, validando que el nuevo valor sea único y tenga un formato válido.

#### Escenario: Edición exitosa de slug
- DADO que la categoría "Running" tiene el slug "running"
- CUANDO el gestor comercial lo actualiza a "zapatillas-running"
- ENTONCES el sistema guarda el nuevo slug siempre que no esté en uso por otra categoría

#### Escenario: Intento de asignar un slug ya utilizado por otra categoría
- DADO que la categoría "Fútbol" ya usa el slug "futbol"
- CUANDO el gestor comercial intenta asignar el slug "futbol" a la categoría "Balones"
- ENTONCES el sistema rechaza el cambio e indica que el slug ya está en uso

### Requisito 3: Configuración de metadatos SEO
El sistema DEBE permitir configurar meta-título, meta-descripción y palabras clave para cada categoría, validando su longitud recomendada.

#### Escenario: Configuración exitosa de metadatos
- DADO que el gestor comercial edita la categoría "Running"
- CUANDO ingresa un meta-título de 50 caracteres y una meta-descripción de 140 caracteres
- ENTONCES el sistema guarda ambos valores sin advertencias, por estar dentro de los límites recomendados

#### Escenario: Meta-descripción que excede la longitud recomendada
- DADO que el gestor comercial ingresa una meta-descripción de 200 caracteres
- CUANDO intenta guardar los cambios
- ENTONCES el sistema permite el guardado pero muestra una advertencia indicando que excede los 160 caracteres recomendados para buscadores

### Requisito 4: Exposición de datos SEO al canal Marketplace
El sistema DEBE exponer un endpoint que retorne el slug y los metadatos SEO de una categoría activa para que el canal Marketplace los use al renderizar su página.

#### Escenario: Consulta exitosa de metadatos por slug
- DADO que existe la categoría activa "Running" con slug "zapatillas-running" y metadatos configurados
- CUANDO el canal Marketplace solicita la información de la categoría mediante su slug
- ENTONCES el sistema retorna el nombre, meta-título, meta-descripción y palabras clave de la categoría

#### Escenario: Consulta de metadatos de una categoría inactiva
- DADO que la categoría "Descontinuados" tiene estado INACTIVO
- CUANDO el canal Marketplace solicita su información mediante el slug
- ENTONCES el sistema retorna un error indicando que la categoría no está disponible

## 5. Requisitos no funcionales
- Rendimiento: la consulta de metadatos por slug debe responder en menos de 300 ms, ya que impacta directamente el tiempo de carga de las páginas del Marketplace.
- Seguridad: la edición de slugs y metadatos solo puede ser realizada por el gestor comercial autenticado; la consulta por slug puede ser pública.
- Disponibilidad: el endpoint de consulta debe tener alta disponibilidad, dado que afecta el SEO y la experiencia de carga del Marketplace en producción.
- Usabilidad: el sistema debe mostrar advertencias claras (no bloqueantes) cuando los campos SEO excedan las longitudes recomendadas.

## 6. Fuera de alcance
- Generación de slugs y metadatos para productos individuales — corresponde al módulo de Catálogo Core (Gabriel), aunque puede reutilizar la misma lógica de normalización.
- Posicionamiento real en buscadores (SEO off-page, backlinks, Google Search Console) — queda fuera del alcance técnico del proyecto.
- Generación automática de meta-descripciones mediante IA o resúmenes — no forma parte de esta capacidad, pero podría considerarse como mejora futura.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.

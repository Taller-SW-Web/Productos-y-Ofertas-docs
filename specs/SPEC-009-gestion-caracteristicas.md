# SPEC-009 — Especificación: Gestión de características y sus valores

## 1. Contexto
Los productos requieren atributos como color, talla o material (características) y su clasificación por marcas. Este documento unifica la gestión del CRUD de Características, la Asociación de estas con Categorías, y el Módulo de Marcas.

## 2. Propósito
Permitir al gestor mantener el catálogo de características, asociarlas bajo reglas claras a las categorías, y administrar la base de marcas del sistema.

## 3. Alcance
- CRUD de Características (Texto, Número, Lista).
- Módulo de Marcas completo (CRUD, activación, duplicidad).
- Asociación Categoría-Característica (herencia, obligatoriedad, límites).
- El detalle completo de Marcas y de la Asociación se rige por sus especificaciones dedicadas (ver sección 6).

## 4. Requisitos

### Requisito 1: Creación y límites de características
El sistema DEBE permitir crear características. Si es `TEXTO`, se limita a 100 caracteres. Si es `NUMERO`, se exige unidad de medida y se valida que el input final solo acepte formatos numéricos.

### Requisito 2: Gestión de valores para tipo LISTA
El sistema DEBE limitar los valores de una característica tipo `LISTA` a un máximo de 50 valores activos. 
*Impacto al renombrar:* Al renombrar un valor en uso, el cambio se refleja automáticamente en los productos asociados, ya que la relación es por ID y no por string.

### Requisito 3: Módulo de Marcas (CRUD)
El sistema DEBE permitir el registro y mantenimiento de Marcas independientes.
#### Escenarios de Marcas
- **Creación:** Se debe validar la duplicidad del nombre (ignorando mayúsculas/minúsculas).
- **Desactivación:** No se puede desactivar una marca si tiene productos activos vinculados.
- **Edición:** Se permite modificar logo y nombre (validando unicidad). Eliminación siempre lógica.

### Requisito 4: Asociación Categoría-Característica
El sistema DEBE gestionar cómo las características aplican a las categorías.
#### Reglas de Asociación Formalizadas:
1. **Herencia:** Las características asociadas a una categoría padre SE HEREDAN obligatoriamente a todas sus subcategorías.
2. **Cambio opcional a obligatoria:** Si una característica pasa de opcional a obligatoria, los productos preexistentes NO se invalidan de inmediato; la obligatoriedad se exigirá en la próxima edición/guardado de cada producto.
3. **Límite por categoría:** Se establece un máximo estricto de 20 características asociables por cada categoría para no afectar el rendimiento ni la UX del formulario de productos.

## 5. Requisitos no funcionales
- Consistencia por ID para permitir renombre de valores sin romper histórico.
- Respuestas de API < 500ms al listar características y marcas.

## 6. Referencias a especificaciones dedicadas
El detalle completo de las siguientes capacidades se rige por sus documentos dedicados; los requisitos de este documento son un resumen:
- **Módulo de Marcas:** `SPEC-011-gestion-marcas.md` (HU `HU-011-gestion-marcas.md`).
- **Asociación Categoría-Característica:** `SPEC-010-asociacion-categoria-caracteristica.md` (HU `HU-010-asociacion-categoria-caracteristica.md`).
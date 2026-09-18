# Especificación: Gestión de categorías y subcategorías

## 1. Contexto
El catálogo se organiza en categorías y subcategorías para que los clientes y canales de venta puedan navegar y filtrar los productos correctamente. Este documento define el ciclo de vida de las categorías: creación, actualización (incluida la reasignación de padre), baja lógica y reactivación.

## 2. Propósito
Permitir al gestor comercial crear, organizar y mantener la jerarquía de categorías del catálogo bajo reglas claras de profundidad, parentesco y estado.

## 3. Alcance
- Creación de categorías con padre opcional.
- Actualización de datos editables, incluido `categoria_padre_id`.
- Jerarquía de máximo 2 niveles (raíz y subcategoría).
- Baja lógica (nunca eliminación física) y reactivación con validaciones.
- Exposición del árbol jerárquico completo para canales externos.

## 4. Requisitos

### Requisito 1: Creación de categorías
El sistema DEBE permitir crear una categoría con nombre y descripción, indicando opcionalmente una categoría padre. El nombre NO es único: puede repetirse en distintas ramas.

### Requisito 2: Jerarquía máxima
El sistema DEBE limitar la jerarquía a un máximo de 2 niveles: categoría raíz y subcategoría. Una subcategoría no puede tener hijos.

### Requisito 3: Referencias circulares
El sistema NO DEBE permitir que una categoría se asigne como su propia categoría padre.

### Requisito 4: Actualización de campos editables
El sistema DEBE incluir explícitamente el campo `categoria_padre_id` entre los campos editables al actualizar una categoría (junto con nombre, descripción, orden e imagen), sin afectar los productos ya asociados.

#### Escenario: Actualización del campo `categoria_padre_id`
- DADO que existe una subcategoría "Accesorios" y una categoría raíz "Fútbol"
- CUANDO el gestor actualiza la subcategoría asignando el `categoria_padre_id` de "Fútbol"
- ENTONCES el sistema cambia su ubicación en el árbol respetando el máximo de 2 niveles

### Requisito 5: Validación del nuevo padre
Al cambiar el `categoria_padre_id`, el sistema DEBE validar que el nuevo padre esté activo y que no se superen los 2 niveles de jerarquía.

### Requisito 6: Baja lógica
El sistema DEBE permitir desactivar (baja lógica) una categoría, validando mediante llamada síncrona que no existan productos activos asociados. Si existe al menos un producto activo, la baja se bloquea.

#### Escenario: Baja lógica con productos
- DADO que una categoría tiene al menos un producto activo
- CUANDO se intenta desactivar
- ENTONCES se bloquea la acción para no dejar productos huérfanos en canales de venta

### Requisito 7: Reactivación
El sistema DEBE permitir reactivar una categoría previamente desactivada, exigiendo que su categoría padre (si la tuviese) esté en estado activo.

#### Escenario: Reactivación de categoría con padre inactivo
- DADO que la categoría "Running" (hija) y "Zapatillas" (padre) están inactivas
- CUANDO el gestor solicita reactivar "Running"
- ENTONCES el sistema arroja un error requiriendo reactivar primero la categoría padre

### Requisito 8: Prohibición de eliminación física
El sistema NUNCA DEBE eliminar físicamente una categoría; toda baja es lógica.

### Requisito 9: Exposición del árbol jerárquico
El sistema DEBE exponer el árbol jerárquico completo para canales externos.

## 5. Requisitos no funcionales
- La validación síncrona de productos activos con Catálogo Core es bloqueante.
- La consulta del árbol jerárquico debe estar disponible de forma constante para canales externos.

## 6. Fuera de alcance
- Asociación de características a categorías — corresponde a la capacidad "Asociación Categoría-Característica".
- Configuración de slugs y metadatos SEO de categorías — corresponde a la capacidad "Gestión de SEO y metadatos".

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se incorporaron funcionalidades fuera del alcance.
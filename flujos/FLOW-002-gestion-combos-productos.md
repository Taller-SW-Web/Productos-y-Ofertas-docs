# FLOW-002 — Gestión de combos de productos

## 1. Identificación

- **Código:** FLOW-002
- **Funcionalidad:** Gestión de combos de productos
- **Relacionado con:** [HU-002](../hu/HU-002-gestion-combos-productos.md) / [SPEC-002](../specs/SPEC-002-gestion-combos-productos.md) / [WF-002](../wireframes/flows/WF-002-gestion-combos-productos.md)
- **Responsable:** Marco Renato Castilla Huanca
- **Última actualización:** 2026-09-23

---

## 2. Objetivo del flujo

Representar la consulta, creación, edición y desactivación de combos compuestos por SKUs vendibles directos. El flujo contempla la validación de componentes, cantidades y precio, el cálculo informativo de disponibilidad, la reacción ante cambios en los componentes y los movimientos atómicos de inventario derivados del ciclo de una venta confirmada.

---

## 3. Actores participantes

- **Gestor comercial:** consulta, crea, edita y desactiva combos.
- **Sistema de combos:** valida la composición y el precio, calcula la disponibilidad y mantiene el estado comercial del combo.
- **Catálogo y Pricing:** informan elegibilidad, estado y precios vigentes de los SKUs.
- **Inventario:** proporciona la proyección de existencias y ejecuta débitos o reposiciones atómicas.
- **Ventas y Postventa:** comunican ventas confirmadas, cancelaciones y devoluciones aceptadas.
- **Canales de venta:** consultan la disponibilidad y reflejan el estado comercial del combo.

---

## 4. Diagramas de flujo

### 4.1 Consulta, creación, edición y desactivación manual

```mermaid
flowchart LR

    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Acceso a gestión de combos))
        D1{"¿Qué acción desea realizar?"}
        G1["Abrir detalle del combo"]
        G2["Ingresar nombre y descripción"]
        G3["Seleccionar SKUs vendibles directos"]
        G4["Asignar cantidades enteras positivas"]
        G5["Ingresar precio del combo"]
        G6["Guardar combo"]
        G7["Corregir composición o precio"]
        G8["Solicitar desactivación"]
        D5{"¿Confirma la desactivación?"}
    end

    subgraph SISTEMA["Sistema de combos"]
        direction TB
        S1["Listar combos con precio, disponibilidad y estado"]
        S2["Mostrar composición, referencias y disponibilidad"]
        S3["Cargar datos vigentes para crear o editar"]
        S4["Impedir combos anidados y SKUs duplicados"]
        D2{"¿Hay al menos dos SKUs elegibles, distintos y con cantidades válidas?"}
        S5["Calcular suma regular, suma pública y disponibilidad estimada"]
        D3{"¿El precio es mayor que cero y menor que ambas sumas?"}
        S6["Revalidar componentes, precios y estado al guardar"]
        D4{"¿Cuál fue el resultado de la revalidación?"}
        S7["Registrar o actualizar el combo"]
        S8["Conservar datos y mostrar error recuperable"]
        S9["Mostrar impacto de la desactivación"]
        S10["Marcar combo inactivo"]
    end

    FIN_CONSULTA(((Combo consultado)))
    FIN_GUARDADO(((Combo creado o actualizado)))
    FIN_INACTIVO(((Combo desactivado)))
    FIN_CANCELADO(((Operación cancelada)))

    INICIO --> S1
    S1 --> D1
    D1 -->|"Consultar"| G1
    G1 --> S2
    S2 --> FIN_CONSULTA

    D1 -->|"Crear o editar"| S3
    S3 --> G2
    G2 --> G3
    G3 --> S4
    S4 --> G4
    G4 --> D2
    D2 -->|"No"| G7
    G7 --> G3
    D2 -->|"Sí"| S5
    S5 --> G5
    G5 --> D3
    D3 -->|"No"| G7
    D3 -->|"Sí"| G6
    G6 --> S6
    S6 --> D4
    D4 -->|"Datos cambiaron"| G7
    D4 -->|"Reglas válidas"| S7
    S7 --> FIN_GUARDADO
    D4 -->|"Fallo técnico"| S8
    S8 --> G6

    D1 -->|"Desactivar"| G8
    G8 --> S9
    S9 --> D5
    D5 -->|"No"| FIN_CANCELADO
    D5 -->|"Sí"| S10
    S10 --> FIN_INACTIVO
```

### 4.2 Cálculo de disponibilidad informativa

```mermaid
flowchart LR

    subgraph SOLICITANTE["Gestor o canal de venta"]
        direction TB
        INICIO((Consulta de disponibilidad))
    end

    subgraph COMBOS["Sistema de combos"]
        direction TB
        S1["Leer la última proyección por SKU"]
        D1{"¿La proyección está completa y vigente?"}
        S2["Informar disponibilidad no verificable"]
        S3["Calcular mínimo de stock entre cantidad requerida"]
        D2{"¿El resultado es cero?"}
        S4["Mostrar combo agotado"]
        S5["Mostrar estimación, componente limitante y calculated_at"]
    end

    FIN_NO_VERIFICABLE(((Disponibilidad no verificable)))
    FIN_AGOTADO(((Combo no disponible)))
    FIN_ESTIMADO(((Disponibilidad estimada)))

    INICIO --> S1
    S1 --> D1
    D1 -->|"No"| S2
    S2 --> FIN_NO_VERIFICABLE
    D1 -->|"Sí"| S3
    S3 --> D2
    D2 -->|"Sí"| S4
    S4 --> FIN_AGOTADO
    D2 -->|"No"| S5
    S5 --> FIN_ESTIMADO
```

> La disponibilidad es una estimación y no reserva ni garantiza stock. Inventario realiza la validación vinculante únicamente al confirmar la venta.

### 4.3 Reacción ante cambios en componentes y precios

```mermaid
flowchart LR

    subgraph FUENTES["Catálogo y Pricing"]
        direction TB
        INICIO((Cambio confirmado en un componente))
        D1{"¿Qué cambió?"}
        E1((SKU componente desactivado))
        E2((Precio del componente modificado))
    end

    subgraph COMBOS["Sistema de combos"]
        direction TB
        S1["Identificar combos afectados por el estado"]
        S2["Marcar combo inactivo"]
        S3["Identificar combos afectados y recalcular referencias"]
        D2{"¿El precio del combo sigue siendo válido?"}
        S4["Actualizar referencias vigentes"]
        S5["Marcar combo no elegible para nuevas ventas"]
        S6["Generar alerta de revisión"]
    end

    subgraph RESULTADO["Gestor y canales de venta"]
        direction TB
        R1["Reflejar baja comercial de forma eventual"]
        R2["Revisar componente o precio causante"]
    end

    FIN_ACTIVO(((Combo continúa elegible)))
    FIN_INACTIVO(((Combo retirado de nuevas ventas)))

    INICIO --> D1
    D1 -->|"Estado del SKU"| E1
    E1 --> S1
    S1 --> S2
    S2 --> S6
    S6 --> R1
    R1 --> R2
    R2 --> FIN_INACTIVO

    D1 -->|"Precio"| E2
    E2 --> S3
    S3 --> D2
    D2 -->|"Sí"| S4
    S4 --> FIN_ACTIVO
    D2 -->|"No"| S5
    S5 --> S6
```

### 4.4 Débito, compensación y devolución de inventario

```mermaid
flowchart LR

    subgraph VENTAS["Ventas y Postventa"]
        direction TB
        INICIO((Pedido con combo confirmado))
        V1["Comunicar SKUs, cantidades y snapshot del combo"]
        D2{"¿Qué evento posterior ocurre?"}
        V2["Comunicar cancelación antes del despacho"]
        V3["Comunicar líneas y cantidades devueltas aceptadas"]
        V4["Resolver pedido o pago ante rechazo"]
    end

    subgraph INVENTARIO["Inventario"]
        direction TB
        I1["Validar existencias de todos los componentes"]
        D1{"¿Hay stock suficiente para todos?"}
        I2["Descontar todos los componentes en una transacción"]
        I3["Rechazar el débito sin aplicar cambios parciales"]
        I4["Reponer atómicamente las cantidades descontadas"]
        I5["Reponer de forma idempotente solo las líneas aceptadas"]
    end

    FIN_CONFIRMADA(((Venta confirmada con stock descontado)))
    FIN_RECHAZADA(((Venta pendiente de resolución)))
    FIN_COMPENSADA(((Stock compensado por cancelación)))
    FIN_DEVUELTA(((Stock repuesto por devolución aceptada)))

    INICIO --> V1
    V1 --> I1
    I1 --> D1
    D1 -->|"No"| I3
    I3 --> V4
    V4 --> FIN_RECHAZADA
    D1 -->|"Sí"| I2
    I2 --> D2
    D2 -->|"Ninguno"| FIN_CONFIRMADA
    D2 -->|"Cancelación"| V2
    V2 --> I4
    I4 --> FIN_COMPENSADA
    D2 -->|"Devolución aceptada"| V3
    V3 --> I5
    I5 --> FIN_DEVUELTA
```

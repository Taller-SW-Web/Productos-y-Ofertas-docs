# FLOW-001 — Carga y exportación masiva de productos

## 1. Identificación

- **Código:** FLOW-001
- **Funcionalidad:** Carga y exportación masiva de productos
- **Relacionado con:** [HU-001](../hu/HU-001-carga-exportacion-masiva-productos.md) / [SPEC-001](../specs/SPEC-001-carga-exportacion-masiva-productos.md) / [WF-001](../wireframes/flows/WF-001-carga-exportacion-masiva-productos.md)
- **Responsable:** Marco Renato Castilla Huanca
- **Última actualización:** 2026-09-23

---

## 2. Objetivo del flujo

Representar la descarga de la plantilla oficial, la exportación asíncrona del catálogo y la importación masiva de productos y variantes. El flujo incluye la prevalidación del archivo, el procesamiento por fila en los dominios correspondientes y la presentación de resultados totales, parciales o generales sin asumir una reversión distribuida.

---

## 3. Actores participantes

- **Gestor comercial:** descarga archivos, prepara y confirma importaciones y consulta sus resultados.
- **Sistema de carga masiva:** valida archivos, administra lotes y exportaciones y consolida resultados.
- **Catálogo:** crea o actualiza productos y variantes y valida su identidad y versión.
- **Pricing:** aplica precios y valida su versión.
- **Inventario:** aplica conteos por ubicación con control de versión y registra el ajuste.

---

## 4. Diagramas de flujo

### 4.1 Descarga de plantilla y exportación del catálogo

```mermaid
flowchart LR

    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Acceso a carga masiva))
        D1{"¿Qué archivo necesita?"}
        G1["Elegir formato de plantilla"]
        G2["Elegir formato de exportación"]
        G3["Consultar estado de exportación"]
        G4["Descargar catálogo generado"]
    end

    subgraph SISTEMA["Sistema de carga masiva"]
        direction TB
        S1["Generar plantilla oficial versionada"]
        E1((Descarga de plantilla iniciada))
        S2["Crear trabajo de exportación"]
        E2((Exportación en cola))
        S3["Generar catálogo completo por SKU"]
        D2{"¿Cuál es el estado del trabajo?"}
        S4["Publicar archivo protegido"]
        S5["Conservar export_id y detalle del fallo"]
    end

    FIN_PLANTILLA(((Plantilla descargada)))
    FIN_EXPORTACION(((Catálogo exportado)))
    FIN_FALLO(((Exportación pendiente de reanudación)))

    INICIO --> D1
    D1 -->|"Plantilla vacía"| G1
    G1 --> S1
    S1 --> E1
    E1 --> FIN_PLANTILLA

    D1 -->|"Catálogo completo"| G2
    G2 --> S2
    S2 --> E2
    E2 --> S3
    S3 --> D2
    D2 -->|"En cola o procesando"| G3
    G3 --> D2
    D2 -->|"Completado"| S4
    S4 --> G4
    G4 --> FIN_EXPORTACION
    D2 -->|"FAILED_GENERAL"| S5
    S5 --> FIN_FALLO
```

### 4.2 Selección, prevalidación y confirmación de una importación

```mermaid
flowchart LR

    subgraph GESTOR["Gestor comercial"]
        direction TB
        INICIO((Archivo preparado))
        G1["Seleccionar archivo XLSX o CSV"]
        G2["Revisar resumen del archivo"]
        D2{"¿Confirma la importación?"}
        G3["Corregir o sustituir archivo"]
    end

    subgraph SISTEMA["Sistema de carga masiva"]
        direction TB
        E1((Archivo recibido))
        S1["Validar extensión, MIME y cabeceras"]
        S2["Validar límite de 5.000 filas y 10 MB"]
        S3["Detectar fórmulas, macros o contenido activo"]
        D1{"¿El archivo cumple la estructura segura?"}
        S4["Mostrar causas del rechazo total"]
        S5["Mostrar resumen y reglas críticas"]
        S6["Crear lote idempotente"]
        E2((Lote en cola con batch_id))
    end

    FIN_CANCELADO(((Importación cancelada sin crear lote)))
    FIN_RECHAZADO(((Archivo rechazado antes de encolar)))
    FIN_ENCOLADO(((Procesamiento asíncrono iniciado)))

    INICIO --> G1
    G1 --> E1
    E1 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> D1
    D1 -->|"No"| S4
    S4 --> G3
    G3 --> FIN_RECHAZADO
    D1 -->|"Sí"| S5
    S5 --> G2
    G2 --> D2
    D2 -->|"No"| FIN_CANCELADO
    D2 -->|"Sí"| S6
    S6 --> E2
    E2 --> FIN_ENCOLADO
```

### 4.3 Procesamiento del lote y consolidación del resultado

```mermaid
flowchart LR

    subgraph BULK["Sistema de carga masiva"]
        direction TB
        INICIO((Lote en cola))
        B1["Validar reglas de negocio por fila"]
        D1{"¿La fila es válida?"}
        B2["Registrar fila rechazada y motivo"]
        B3["Determinar dominios que debe modificar"]
        B4["Conservar valores de celdas vacías en actualizaciones"]
        B5["Correlacionar operaciones con batch_id y row_id"]
        D3{"¿Todos los dominios requeridos confirmaron?"}
        B6["Marcar fila COMPLETED"]
        B7["Marcar fila FAILED"]
        B8["Registrar dominios aplicados, dominio fallido y conciliación"]
        D4{"¿Cuál es el estado del lote?"}
        B9["Reintentar operaciones pendientes de forma idempotente"]
        D6{"¿Se recuperó dentro de tres intentos?"}
        B10["Marcar lote FAILED_GENERAL y conservar estado por fila"]
        B11["Consolidar totales y registrar auditoría"]
        D7{"¿Existen filas fallidas?"}
        B12["Generar CSV con errores y estado por dominio"]
    end

    subgraph DOMINIOS["Catálogo, Pricing e Inventario"]
        direction TB
        E1((Operaciones por dominio recibidas))
        P1["Procesar cada dominio y registrar su resultado"]
    end

    subgraph GESTOR["Gestor comercial"]
        direction TB
        G1["Consultar o reanudar el mismo lote"]
        G2["Visualizar resultado total"]
        G3["Visualizar resumen parcial y descargar CSV"]
    end

    FIN_OK(((Lote completado sin errores)))
    FIN_PARCIAL(((Lote completado con errores parciales)))
    FIN_GENERAL(((Lote con fallo general recuperable)))

    INICIO --> B1
    B1 --> D1
    D1 -->|"No"| B2
    D1 -->|"Sí"| B3
    B3 --> B4
    B4 --> B5
    B5 --> E1
    E1 --> P1
    P1 --> D3
    D3 -->|"Sí"| B6
    D3 -->|"No"| B7
    B7 --> B8
    B2 --> D4
    B6 --> D4
    B8 --> D4
    D4 -->|"Quedan filas"| B1
    D4 -->|"Fallo general"| B9
    B9 --> D6
    D6 -->|"Sí"| B1
    D6 -->|"No"| B10
    B10 --> G1
    G1 --> FIN_GENERAL
    D4 -->|"Sin pendientes"| B11
    B11 --> D7
    D7 -->|"No"| G2
    G2 --> FIN_OK
    D7 -->|"Sí"| B12
    B12 --> G3
    G3 --> FIN_PARCIAL
```

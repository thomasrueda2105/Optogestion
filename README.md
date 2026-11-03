# Sistema Optogestión - Centro de Atención Optométrica (Universidad CES)

![Python Version](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Estado](https://img.shields.io/badge/Estado-Producción%20Académica-brightgreen.svg)
![Institución](https://img.shields.io/badge/Institución-Universidad%20CES-007A33.svg)

**Sistema Optogestión** es una solución de software por consola desarrollada en Python para la gestión integral de pacientes, control de agudeza visual y generación de estadísticas demográficas en el **Centro Universitario de Atención Optométrica de la Universidad CES** (Medellín, Colombia).

---

## 📋 Tabla de Contenido
1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Estructura de Datos](#-estructura-de-datos)
3. [Módulos y Funcionalidades](#-módulos-y-funcionalidades)
4. [Requisitos del Sistema](#-requisitos-del-sistema)
5. [Instrucciones de Instalación y Ejecución](#-instrucciones-de-instalación-y-ejecución)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [Manejo de Errores y Validaciones](#-manejo-de-errores-y-validaciones)
8. [Créditos](#-créditos)

---

## 🎯 Descripción del Proyecto
El software permite registrar a los pacientes que asisten a las jornadas optométricas, almacenar sus datos de forma persistente en formato JSON, realizar consultas rápidas por identificación, filtrar pacientes según necesidad de corrección óptica (anteojos o lentes de contacto) y generar informes estadísticos automáticos de la jornada de salud.

---

## 🗄️ Estructura de Datos
La información se organiza en una **lista de diccionarios**, donde cada registro representa a un paciente con las siguientes claves obligatorias:

| Clave | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `id` | `str` / `int` | Identificación única del paciente | `"1001"` |
| `nombre` | `str` | Nombre y apellidos del paciente | `"Mariana Gómez Restrepo"` |
| `edad` | `int` | Edad en años cumplidos (rango de 1 a 120) | `22` |
| `sexo` | `str` | Género/sexo del paciente (`F`, `M`, `O`) | `"F"` |
| `usa_correccion`| `bool` | Booleano que indica si utiliza corrección óptica | `True` o `False` |

### Persistencia en `pacientes.json`
Al iniciar el programa:
- El sistema comprueba si existe `pacientes.json` y si contiene información.
- Si el archivo **no existe o está vacío**, se inicializa automáticamente con **5 registros de prueba predeterminados** para permitir evaluaciones inmediatas.
- Toda modificación se almacena de forma persistente al salir (Opción 6) o de manera preventiva en cada registro.

---

## ⚙️ Módulos y Funcionalidades

El menú principal interactivo presenta 6 opciones organizadas en funciones modulares:

### 1. `registrar_paciente(pacientes)`
- Solicita documento/ID, nombre completo, edad, sexo y uso de corrección visual.
- **Validaciones:**
  - Evita duplicados en el número de identificación.
  - La edad debe ser estrictamente un número entero comprendido entre **1 y 120 años**.
  - El uso de corrección visual acepta respuestas como `Sí`, `No`, `S`, `N`, `True`, `False`, `1`, `0` y las traduce a tipos booleanos `True` o `False`.

### 2. `consultar_paciente(pacientes)`
- Permite buscar un paciente específico a través de su identificador (`id`).
- Muestra una ficha ordenada con todos sus datos clínicos si se encuentra en la base, o emite un aviso oportuno si no existe.

### 3. `mostrar_pacientes(pacientes)`
- Recorre la lista de pacientes mediante un ciclo `for`.
- Consulta la clave `"nombre"` y presenta un listado tabular prolijo con índice, ID, nombre, edad, sexo y estado de corrección.

### 4. `buscar_pacientes_correccion(pacientes)`
- Filtra aquellos registros donde `usa_correccion == True`.
- Imprime los nombres y detalles de todos los pacientes que requieren o portan lentes, o notifica en pantalla si ninguno cumple con esta condición.

### 5. `generar_estadisticas(pacientes)`
- Realiza el balance de la jornada optométrica:
  - **Total de pacientes atendidos**.
  - **Edad promedio** (con formato decimal redondeado).
  - **Rango de edades** (edad mínima y máxima).
  - **Cantidad y porcentaje de pacientes que usan corrección óptica**.
  - **Desglose demográfico por sexo**.
  - **Protección de división por cero:** Si la base de datos se encuentra vacía, informa al operador en lugar de generar una excepción `ZeroDivisionError`.

### 6. `guardar_y_salir(pacientes)`
- Escribe todos los cambios en el archivo `pacientes.json`.
- Imprime un mensaje institucional de despedida y finaliza la ejecución con código de salida `0`.

---

## 💻 Requisitos del Sistema
- **Python 3.8 o superior** (sin necesidad de librerías externas adicionales; utiliza únicamente librerías estándar: `json`, `os`, `sys`).
- Cualquier terminal o consola de comandos (Windows PowerShell, CMD, macOS Terminal, Linux Bash).

---

## 🚀 Instrucciones de Instalación y Ejecución

### Paso 1: Clonar o descargar el repositorio
Descarga el archivo `optogestion.py` y `pacientes.json` en una carpeta de tu preferencia.

### Paso 2: Abrir una terminal en el directorio
```bash
# Verificar la versión de Python instalada
python3 --version  # o 'python --version' en Windows
```

### Paso 3: Ejecutar el programa
```bash
python3 optogestion.py
```
*(En Windows también puedes ejecutar: `python optogestion.py`)*

---

## 📁 Estructura del Proyecto
```text
optogestion/
│
├── optogestion.py       # Código fuente modular en Python con las 6 opciones
├── pacientes.json       # Base de datos en formato JSON (autocreada si no existe)
└── README.md            # Documentación completa y manual de usuario
```

---

## 🛡️ Manejo de Errores y Validaciones
- **Entradas no numéricas:** Protegidas con bloques `try - except ValueError`.
- **Rango de edad:** Limitado a un intervalo biológicamente viable (1 a 120 años).
- **División por cero:** Controlada mediante verificación preventiva de longitud de lista (`len(pacientes) > 0`).
- **Codificación:** Archivo JSON guardado con codificación `UTF-8` para soportar tildes y caracteres especiales en español.
- **Interrupción de teclado:** Captura de `KeyboardInterrupt` (`Ctrl + C`) para cierre limpio del programa.

---

## 🏛️ Créditos
- **Institución:** Universidad CES — Medellín, Colombia.
- **Dependencia:** Centro Universitario de Atención Optométrica.
- **Programa:** Optometría y Ciencias de la Visión.

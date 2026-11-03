"""
=============================================================================
SISTEMA OPTOGESTIÓN - CENTRO UNIVERSITARIO DE ATENCIÓN OPTOMÉTRICA
UNIVERSIDAD CES
=============================================================================
Programa de consola en Python para la administración de pacientes,
evaluaciones optométricas y control estadístico.

Autor: Equipo de Desarrollo Universidad CES
Requisitos: Python 3.8+
=============================================================================
"""

import json
import os
import sys

ARCHIVO_DATOS = "pacientes.json"

# Registros de prueba iniciales requeridos si el archivo no existe o está vacío
DATOS_SEMILLA = [
    {
        "id": "1020345678",
        "nombre": "Mariana Gómez Restrepo",
        "edad": 22,
        "sexo": "F",
        "usa_correccion": True
    },
    {
        "id": "1017234890",
        "nombre": "Carlos Andrés Jaramillo",
        "edad": 45,
        "sexo": "M",
        "usa_correccion": True
    },
    {
        "id": "1035678912",
        "nombre": "Valentina Londoño Ortiz",
        "edad": 19,
        "sexo": "F",
        "usa_correccion": False
    },
    {
        "id": "1008456123",
        "nombre": "Mateo Restrepo Pérez",
        "edad": 68,
        "sexo": "M",
        "usa_correccion": True
    },
    {
        "id": "1042789456",
        "nombre": "Sofía Ramírez Calle",
        "edad": 31,
        "sexo": "F",
        "usa_correccion": False
    }
]


# =============================================================================
# PERSISTENCIA DE DATOS (JSON)
# =============================================================================

def cargar_pacientes(ruta=ARCHIVO_DATOS):
    """
    Carga los pacientes desde el archivo JSON especificado.
    Si el archivo no existe o está vacío, lo inicializa con los 5 registros
    de prueba iniciales para efectos prácticos.
    """
    if not os.path.exists(ruta) or os.path.getsize(ruta) == 0:
        print(f"\n[INFO] Archivo '{ruta}' no encontrado o vacío.")
        print("[INFO] Inicializando sistema con 5 registros de prueba predeterminados...")
        guardar_pacientes(DATOS_SEMILLA, ruta)
        return list(DATOS_SEMILLA)

    try:
        with open(ruta, "r", encoding="utf-8") as archivo:
            datos = json.load(archivo)
            if not isinstance(datos, list):
                print("[ADVERTENCIA] Formato no válido en el archivo. Recreando registros iniciales...")
                guardar_pacientes(DATOS_SEMILLA, ruta)
                return list(DATOS_SEMILLA)
            print(f"[OK] Se cargaron {len(datos)} pacientes exitosamente desde '{ruta}'.")
            return datos
    except (json.JSONDecodeError, IOError) as error:
        print(f"[ERROR] Error al leer el archivo JSON ({error}).")
        print("[INFO] Reestableciendo registros iniciales de prueba...")
        guardar_pacientes(DATOS_SEMILLA, ruta)
        return list(DATOS_SEMILLA)


def guardar_pacientes(pacientes, ruta=ARCHIVO_DATOS):
    """
    Guarda la lista de diccionarios de pacientes en el archivo JSON con sangría
    legible y codificación UTF-8.
    """
    try:
        with open(ruta, "w", encoding="utf-8") as archivo:
            json.dump(pacientes, archivo, indent=4, ensure_ascii=False)
        return True
    except IOError as error:
        print(f"[ERROR] No fue posible guardar los datos en '{ruta}': {error}")
        return False


# =============================================================================
# MÓDULOS FUNCIONALES
# =============================================================================

def validar_edad():
    """
    Solicita y valida que la edad ingresada sea un entero entre 1 y 120 años.
    """
    while True:
        entrada = input("  > Ingrese la edad (1 - 120 años): ").strip()
        try:
            edad = int(entrada)
            if 1 <= edad <= 120:
                return edad
            else:
                print("    [!] Error: La edad debe estar estrictamente entre 1 y 120 años.")
        except ValueError:
            print("    [!] Error: Debe ingresar un número entero válido.")


def validar_booleano_correccion():
    """
    Solicita y valida si el paciente usa corrección visual.
    Acepta opciones flexibles: Sí/No, S/N, True/False, 1/0 y retorna un valor booleano.
    """
    opciones_afirmativas = {"si", "sí", "s", "true", "t", "1", "y", "yes"}
    opciones_negativas = {"no", "n", "false", "f", "0"}

    while True:
        entrada = input("  > ¿El paciente usa corrección visual? (Sí/No): ").strip().lower()
        if entrada in opciones_afirmativas:
            return True
        elif entrada in opciones_negativas:
            return False
        else:
            print("    [!] Entrada inválida. Por favor responda 'Sí' (S) o 'No' (N).")


def registrar_paciente(pacientes):
    """
    Módulo 1: Registrar paciente.
    Solicita los datos obligatorios por consola, valida rangos y tipos,
    verifica duplicidad de identificación y agrega el nuevo diccionario a la lista.
    """
    print("\n" + "=" * 55)
    print("      MÓDULO 1: REGISTRO DE NUEVO PACIENTE")
    print("=" * 55)

    # 1. Validación de ID único
    while True:
        id_paciente = input("  > Ingrese el ID / Documento del paciente: ").strip()
        if not id_paciente:
            print("    [!] El ID no puede estar vacío.")
            continue

        id_existente = any(str(p.get("id")) == str(id_paciente) for p in pacientes)
        if id_existente:
            print(f"    [!] Ya existe un paciente registrado con el ID '{id_paciente}'. Ingrese uno diferente.")
        else:
            break

    # 2. Nombre completo
    while True:
        nombre = input("  > Ingrese el nombre completo: ").strip()
        if nombre:
            break
        print("    [!] El nombre no puede estar vacío.")

    # 3. Validación de Edad (1 - 120)
    edad = validar_edad()

    # 4. Sexo biológico / género
    while True:
        sexo = input("  > Ingrese sexo (F = Femenino, M = Masculino, O = Otro): ").strip().upper()
        if sexo in ["F", "M", "O"]:
            break
        print("    [!] Ingrese una opción válida: F, M u O.")

    # 5. Uso de corrección visual (Booleano)
    usa_correccion = validar_booleano_correccion()

    # Creación del diccionario con la estructura exigida
    nuevo_paciente = {
        "id": id_paciente,
        "nombre": nombre,
        "edad": edad,
        "sexo": sexo,
        "usa_correccion": usa_correccion
    }

    pacientes.append(nuevo_paciente)
    # Guardado automático preventivo
    guardar_pacientes(pacientes)

    print("\n[ÉXITO] Paciente registrado satisfactoriamente en Optogestión.")
    print(f"        ID: {id_paciente} | Nombre: {nombre} | Corrección: {'SÍ' if usa_correccion else 'NO'}")


def consultar_paciente(pacientes):
    """
    Módulo 2: Consultar paciente.
    Permite buscar un paciente mediante su identificador (ID).
    Muestra la ficha clínica o un aviso si no se encuentra.
    """
    print("\n" + "=" * 55)
    print("      MÓDULO 2: CONSULTAR PACIENTE POR IDENTIFICADOR")
    print("=" * 55)

    if not pacientes:
        print("[AVISO] No hay pacientes registrados actualmente en la base de datos.")
        return

    busqueda_id = input("  > Ingrese el ID del paciente a consultar: ").strip()
    encontrado = None

    for paciente in pacientes:
        if str(paciente.get("id")) == str(busqueda_id):
            encontrado = paciente
            break

    if encontrado:
        print("\n" + "-" * 45)
        print("            FICHA DEL PACIENTE")
        print("-" * 45)
        print(f"  • Identificación:       {encontrado.get('id')}")
        print(f"  • Nombre completo:      {encontrado.get('nombre')}")
        print(f"  • Edad:                 {encontrado.get('edad')} años")
        print(f"  • Sexo:                 {encontrado.get('sexo')}")
        correccion_txt = "Sí (requiere/usa lentes o gafas)" if encontrado.get("usa_correccion") else "No usa corrección"
        print(f"  • Usa Corrección Visual: {correccion_txt}")
        print("-" * 45)
    else:
        print(f"\n[AVISO] No se encontró ningún paciente con el ID '{busqueda_id}' en el sistema.")


def mostrar_pacientes(pacientes):
    """
    Módulo 3: Mostrar pacientes registrados.
    Recorre la lista de diccionarios utilizando un ciclo for,
    consultando la clave 'nombre' y mostrando la lista organizada en pantalla.
    """
    print("\n" + "=" * 70)
    print("      MÓDULO 3: LISTADO DE PACIENTES REGISTRADOS (UNIVERSIDAD CES)")
    print("=" * 70)

    if not pacientes:
        print("[AVISO] El sistema no cuenta con pacientes registrados actualmente.")
        return

    print(f"Total de registros: {len(pacientes)}\n")
    encabezado = f"{'#':<4} {'ID':<10} {'NOMBRE':<30} {'EDAD':<6} {'SEXO':<6} {'CORRECCIÓN':<10}"
    print(encabezado)
    print("-" * 70)

    # Recorrido obligatorio mediante ciclo for consultando las claves del diccionario
    for indice, paciente in enumerate(pacientes, start=1):
        nombre = paciente.get("nombre", "Sin nombre")
        id_p = str(paciente.get("id", "N/A"))
        edad = str(paciente.get("edad", "N/A"))
        sexo = str(paciente.get("sexo", "N/A"))
        correccion = "SÍ" if paciente.get("usa_correccion") else "NO"

        print(f"{indice:<4} {id_p:<10} {nombre:<30} {edad:<6} {sexo:<6} {correccion:<10}")

    print("-" * 70)


def buscar_pacientes_correccion(pacientes):
    """
    Módulo 4: Buscar pacientes con corrección visual.
    Muestra los nombres de los pacientes que utilizan corrección óptica,
    o informa al usuario si ninguno cumple la condición.
    """
    print("\n" + "=" * 60)
    print("   MÓDULO 4: PACIENTES CON CORRECCIÓN VISUAL ACTIVA")
    print("=" * 60)

    if not pacientes:
        print("[AVISO] No hay registros en el sistema para evaluar.")
        return

    pacientes_con_lentes = []

    # Recorrido para filtrar quienes usan corrección
    for p in pacientes:
        if p.get("usa_correccion") is True:
            pacientes_con_lentes.append(p)

    if pacientes_con_lentes:
        print(f"\nSe encontraron {len(pacientes_con_lentes)} paciente(s) que usan corrección óptica:\n")
        for i, p in enumerate(pacientes_con_lentes, start=1):
            nombre = p.get("nombre")
            id_p = p.get("id")
            edad = p.get("edad")
            print(f"  {i}. {nombre} (ID: {id_p}, Edad: {edad} años)")
    else:
        print("\n[INFO] Ningún paciente registrado actualmente utiliza corrección visual.")


def generar_estadisticas(pacientes):
    """
    Módulo 5: Generar estadísticas de la jornada optométrica.
    Calcula y muestra en terminal el número total de pacientes, la edad promedio,
    y la cantidad de pacientes que usan corrección visual.
    Incluye validación estricta para evitar errores de división por cero si la lista está vacía.
    """
    print("\n" + "=" * 60)
    print("      MÓDULO 5: ESTADÍSTICAS DE LA JORNADA OPTOMÉTRICA")
    print("=" * 60)

    total_pacientes = len(pacientes)

    # Validación fundamental: evitar división por cero
    if total_pacientes == 0:
        print("[AVISO] No se pueden calcular estadísticas: La lista de pacientes está vacía.")
        print("        Registre al menos un paciente para visualizar métricas.")
        return

    # Cálculos estadísticos
    suma_edades = sum(p.get("edad", 0) for p in pacientes)
    edad_promedio = suma_edades / total_pacientes

    total_con_correccion = sum(1 for p in pacientes if p.get("usa_correccion") is True)
    total_sin_correccion = total_pacientes - total_con_correccion

    porcentaje_con_correccion = (total_con_correccion / total_pacientes) * 100
    porcentaje_sin_correccion = (total_sin_correccion / total_pacientes) * 100

    edades = [p.get("edad", 0) for p in pacientes]
    edad_minima = min(edades)
    edad_maxima = max(edades)

    # Desglose por sexo
    mujeres = sum(1 for p in pacientes if p.get("sexo") == "F")
    hombres = sum(1 for p in pacientes if p.get("sexo") == "M")
    otros = total_pacientes - (mujeres + hombres)

    print(f"\n  • Número total de pacientes atendidos:    {total_pacientes}")
    print(f"  • Edad promedio de los pacientes:        {edad_promedio:.2f} años")
    print(f"  • Rango de edad evaluado:                {edad_minima} a {edad_maxima} años")
    print(f"  • Pacientes con corrección visual:       {total_con_correccion} ({porcentaje_con_correccion:.1f}%)")
    print(f"  • Pacientes sin corrección visual:       {total_sin_correccion} ({porcentaje_sin_correccion:.1f}%)")
    print("\n  Distribución demográfica:")
    print(f"    - Femenino:  {mujeres} ({mujeres / total_pacientes * 100:.1f}%)")
    print(f"    - Masculino: {hombres} ({hombres / total_pacientes * 100:.1f}%)")
    if otros > 0:
        print(f"    - Otro:      {otros} ({otros / total_pacientes * 100:.1f}%)")
    print("-" * 60)


# =============================================================================
# MENÚ PRINCIPAL Y CICLO DE EJECUCIÓN
# =============================================================================

def imprimir_banner():
    """Muestra el membrete institucional del sistema."""
    banner = """
    ╔════════════════════════════════════════════════════════════╗
    ║                 UNIVERSIDAD CES - MEDELLÍN                 ║
    ║         Centro Universitario de Atención Optométrica       ║
    ║               SISTEMA DE GESTIÓN "OPTOGESTIÓN"             ║
    ╚════════════════════════════════════════════════════════════╝
    """
    print(banner)


def menu_principal():
    """
    Controlador principal del sistema interactivo por consola.
    Mantiene el ciclo de ejecución continuo hasta que el usuario elija salir (Opción 6),
    asegurando el guardado de los cambios en el archivo JSON.
    """
    imprimir_banner()
    pacientes = cargar_pacientes(ARCHIVO_DATOS)

    while True:
        print("\n" + "─" * 46)
        print("              MENÚ PRINCIPAL")
        print("─" * 46)
        print("  1. Registrar paciente")
        print("  2. Consultar paciente")
        print("  3. Mostrar pacientes registrados")
        print("  4. Buscar pacientes con corrección visual")
        print("  5. Generar estadísticas")
        print("  6. Salir")
        print("─" * 46)

        opcion = input("  Seleccione una opción (1-6): ").strip()

        if opcion == "1":
            registrar_paciente(pacientes)
        elif opcion == "2":
            consultar_paciente(pacientes)
        elif opcion == "3":
            mostrar_pacientes(pacientes)
        elif opcion == "4":
            buscar_pacientes_correccion(pacientes)
        elif opcion == "5":
            generar_estadisticas(pacientes)
        elif opcion == "6":
            print("\nGuardando información en 'pacientes.json'...")
            guardar_pacientes(pacientes, ARCHIVO_DATOS)
            print("=" * 60)
            print(" ¡Gracias por utilizar el Sistema Optogestión - Universidad CES!")
            print(" Sesión cerrada correctamente.")
            print("=" * 60)
            sys.exit(0)
        else:
            print("\n[!] Opción inválida. Ingrese un número entre 1 y 6.")


# Punto de entrada de ejecución del script
if __name__ == "__main__":
    try:
        menu_principal()
    except KeyboardInterrupt:
        print("\n\n[INFO] Ejecución interrumpida por el usuario. Cerrando programa...")
        sys.exit(0)

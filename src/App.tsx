/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Glasses,
  Users,
  BarChart3,
  Terminal as TerminalIcon,
  Download,
  Copy,
  Check,
  Plus,
  Search,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

interface Paciente {
  id: string;
  nombre: string;
  edad: number;
  sexo: string;
  usa_correccion: boolean;
}

const REGISTROS_INICIALES: Paciente[] = [
  {
    id: "1001",
    nombre: "Mariana Gómez Restrepo",
    edad: 22,
    sexo: "F",
    usa_correccion: true,
  },
  {
    id: "1002",
    nombre: "Carlos Andrés Jaramillo",
    edad: 45,
    sexo: "M",
    usa_correccion: true,
  },
  {
    id: "1003",
    nombre: "Valentina Londoño Ortiz",
    edad: 19,
    sexo: "F",
    usa_correccion: false,
  },
  {
    id: "1004",
    nombre: "Mateo Restrepo Pérez",
    edad: 68,
    sexo: "M",
    usa_correccion: true,
  },
  {
    id: "1005",
    nombre: "Sofía Ramírez Calle",
    edad: 31,
    sexo: "F",
    usa_correccion: false,
  },
];

export default function App() {
  // Estado de los pacientes
  const [pacientes, setPacientes] = useState<Paciente[]>(() => {
    const guardado = localStorage.getItem('optogestion_pacientes');
    if (guardado) {
      try {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return REGISTROS_INICIALES;
  });

  const [activeTab, setActiveTab] = useState<'terminal' | 'dashboard' | 'json'>('terminal');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCorreccion, setFiltroCorreccion] = useState<'todos' | 'con' | 'sin'>('todos');

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  // Formulario nuevo paciente
  const [nuevoId, setNuevoId] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEdad, setNuevoEdad] = useState('');
  const [nuevoSexo, setNuevoSexo] = useState('F');
  const [nuevoCorreccion, setNuevoCorreccion] = useState<boolean>(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Estado copiado JSON
  const [copiadoJson, setCopiadoJson] = useState(false);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalPromptState, setTerminalPromptState] = useState<{
    step: 'menu' | 'reg_id' | 'reg_nom' | 'reg_edad' | 'reg_sex' | 'reg_corr' | 'consultar_id';
    tempData?: Partial<Paciente>;
  }>({ step: 'menu' });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Guardar en localStorage sincronizado
  useEffect(() => {
    localStorage.setItem('optogestion_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  // Inicializar terminal con el banner
  useEffect(() => {
    const banner = [
      "=============================================================================",
      "                 UNIVERSIDAD CES - MEDELLÍN                                  ",
      "         Centro Universitario de Atención Optométrica                         ",
      "               SISTEMA DE GESTIÓN 'OPTOGESTIÓN'                              ",
      "=============================================================================",
      "[OK] Se cargaron " + pacientes.length + " pacientes exitosamente desde 'pacientes.json'.",
      "",
      "----------------------------------------------",
      "              MENÚ PRINCIPAL                  ",
      "----------------------------------------------",
      "  1. Registrar paciente",
      "  2. Consultar paciente",
      "  3. Mostrar pacientes registrados",
      "  4. Buscar pacientes con corrección visual",
      "  5. Generar estadísticas",
      "  6. Salir",
      "----------------------------------------------",
      "  Seleccione una opción (1-6):",
    ];
    setTerminalHistory(banner);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Handler terminal
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    const currStep = terminalPromptState.step;
    const newHistory = [...terminalHistory, `> ${terminalInput}`];
    setTerminalInput('');

    if (currStep === 'menu') {
      if (cmd === '1') {
        newHistory.push(
          "",
          "=======================================================",
          "      MÓDULO 1: REGISTRO DE NUEVO PACIENTE",
          "=======================================================",
          "  > Ingrese el ID / Documento del paciente:"
        );
        setTerminalPromptState({ step: 'reg_id', tempData: {} });
      } else if (cmd === '2') {
        newHistory.push(
          "",
          "=======================================================",
          "      MÓDULO 2: CONSULTAR PACIENTE POR IDENTIFICADOR",
          "=======================================================",
          "  > Ingrese el ID del paciente a consultar:"
        );
        setTerminalPromptState({ step: 'consultar_id' });
      } else if (cmd === '3') {
        // Mostrar pacientes
        newHistory.push(
          "",
          "======================================================================",
          "      MÓDULO 3: LISTADO DE PACIENTES REGISTRADOS (UNIVERSIDAD CES)",
          "======================================================================",
          `Total de registros: ${pacientes.length}`,
          "",
          `#    ID         NOMBRE                         EDAD   SEXO   CORRECCIÓN`,
          "----------------------------------------------------------------------"
        );
        if (pacientes.length === 0) {
          newHistory.push("  [AVISO] El sistema no cuenta con pacientes registrados actualmente.");
        } else {
          pacientes.forEach((p, idx) => {
            const num = (idx + 1).toString().padEnd(4);
            const id = p.id.padEnd(10);
            const nom = p.nombre.slice(0, 28).padEnd(30);
            const edad = p.edad.toString().padEnd(6);
            const sexo = p.sexo.padEnd(6);
            const corr = p.usa_correccion ? "SÍ" : "NO";
            newHistory.push(`${num} ${id} ${nom} ${edad} ${sexo} ${corr}`);
          });
        }
        newHistory.push(
          "----------------------------------------------------------------------",
          "",
          "----------------------------------------------",
          "              MENÚ PRINCIPAL                  ",
          "----------------------------------------------",
          "  1. Registrar paciente",
          "  2. Consultar paciente",
          "  3. Mostrar pacientes registrados",
          "  4. Buscar pacientes con corrección visual",
          "  5. Generar estadísticas",
          "  6. Salir",
          "----------------------------------------------",
          "  Seleccione una opción (1-6):"
        );
      } else if (cmd === '4') {
        // Buscar con corrección
        newHistory.push(
          "",
          "============================================================",
          "   MÓDULO 4: PACIENTES CON CORRECCIÓN VISUAL ACTIVA",
          "============================================================"
        );
        const conLentes = pacientes.filter(p => p.usa_correccion);
        if (conLentes.length > 0) {
          newHistory.push(`Se encontraron ${conLentes.length} paciente(s) que usan corrección óptica:\n`);
          conLentes.forEach((p, i) => {
            newHistory.push(`  ${i + 1}. ${p.nombre} (ID: ${p.id}, Edad: ${p.edad} años, Sexo: ${p.sexo})`);
          });
        } else {
          newHistory.push("[INFO] Ningún paciente registrado actualmente utiliza corrección visual.");
        }
        newHistory.push(
          "",
          "----------------------------------------------",
          "              MENÚ PRINCIPAL                  ",
          "----------------------------------------------",
          "  1. Registrar paciente",
          "  2. Consultar paciente",
          "  3. Mostrar pacientes registrados",
          "  4. Buscar pacientes con corrección visual",
          "  5. Generar estadísticas",
          "  6. Salir",
          "----------------------------------------------",
          "  Seleccione una opción (1-6):"
        );
      } else if (cmd === '5') {
        // Generar estadísticas
        newHistory.push(
          "",
          "============================================================",
          "      MÓDULO 5: ESTADÍSTICAS DE LA JORNADA OPTOMÉTRICA",
          "============================================================"
        );
        const total = pacientes.length;
        if (total === 0) {
          newHistory.push(
            "[AVISO] No se pueden calcular estadísticas: La lista de pacientes está vacía.",
            "        Registre al menos un paciente para visualizar métricas."
          );
        } else {
          const suma = pacientes.reduce((acc, p) => acc + p.edad, 0);
          const prom = suma / total;
          const conCorr = pacientes.filter(p => p.usa_correccion).length;
          const sinCorr = total - conCorr;
          const pctCorr = ((conCorr / total) * 100).toFixed(1);
          const pctSin = ((sinCorr / total) * 100).toFixed(1);
          const edades = pacientes.map(p => p.edad);
          const minEdad = Math.min(...edades);
          const maxEdad = Math.max(...edades);
          const fem = pacientes.filter(p => p.sexo === 'F').length;
          const mas = pacientes.filter(p => p.sexo === 'M').length;
          const otr = total - (fem + mas);

          newHistory.push(
            `  • Número total de pacientes atendidos:    ${total}`,
            `  • Edad promedio de los pacientes:        ${prom.toFixed(2)} años`,
            `  • Rango de edad evaluado:                ${minEdad} a ${maxEdad} años`,
            `  • Pacientes con corrección visual:       ${conCorr} (${pctCorr}%)`,
            `  • Pacientes sin corrección visual:       ${sinCorr} (${pctSin}%)`,
            "",
            "  Distribución demográfica:",
            `    - Femenino:  ${fem} (${((fem / total) * 100).toFixed(1)}%)`,
            `    - Masculino: ${mas} (${((mas / total) * 100).toFixed(1)}%)`
          );
          if (otr > 0) {
            newHistory.push(`    - Otro:      ${otr} (${((otr / total) * 100).toFixed(1)}%)`);
          }
          newHistory.push("------------------------------------------------------------");
        }
        newHistory.push(
          "",
          "----------------------------------------------",
          "              MENÚ PRINCIPAL                  ",
          "----------------------------------------------",
          "  1. Registrar paciente",
          "  2. Consultar paciente",
          "  3. Mostrar pacientes registrados",
          "  4. Buscar pacientes con corrección visual",
          "  5. Generar estadísticas",
          "  6. Salir",
          "----------------------------------------------",
          "  Seleccione una opción (1-6):"
        );
      } else if (cmd === '6') {
        newHistory.push(
          "",
          "Guardando información en 'pacientes.json'...",
          "[OK] Datos sincronizados en formato JSON.",
          "============================================================",
          " ¡Gracias por utilizar el Sistema Optogestión - Universidad CES!",
          " Sesión cerrada correctamente.",
          "============================================================",
          "",
          "[Escriba 'menu' o seleccione una opción rápida para continuar]"
        );
      } else if (cmd.toLowerCase() === 'reiniciar' || cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'menu') {
        newHistory.push(
          "",
          "----------------------------------------------",
          "              MENÚ PRINCIPAL                  ",
          "----------------------------------------------",
          "  1. Registrar paciente",
          "  2. Consultar paciente",
          "  3. Mostrar pacientes registrados",
          "  4. Buscar pacientes con corrección visual",
          "  5. Generar estadísticas",
          "  6. Salir",
          "----------------------------------------------",
          "  Seleccione una opción (1-6):"
        );
      } else {
        newHistory.push(
          `[!] Opción inválida ('${cmd}'). Ingrese un número entre 1 y 6.`
        );
      }
    } else if (currStep === 'reg_id') {
      if (!cmd) {
        newHistory.push("    [!] El ID no puede estar vacío.", "  > Ingrese el ID / Documento del paciente:");
      } else if (pacientes.some(p => p.id === cmd)) {
        newHistory.push(`    [!] Ya existe un paciente con el ID '${cmd}'. Ingrese uno diferente:`);
      } else {
        setTerminalPromptState({
          step: 'reg_nom',
          tempData: { ...terminalPromptState.tempData, id: cmd }
        });
        newHistory.push("  > Ingrese el nombre completo:");
      }
    } else if (currStep === 'reg_nom') {
      if (!cmd) {
        newHistory.push("    [!] El nombre no puede estar vacío.", "  > Ingrese el nombre completo:");
      } else {
        setTerminalPromptState({
          step: 'reg_edad',
          tempData: { ...terminalPromptState.tempData, nombre: cmd }
        });
        newHistory.push("  > Ingrese la edad (1 - 120 años):");
      }
    } else if (currStep === 'reg_edad') {
      const edadNum = parseInt(cmd, 10);
      if (isNaN(edadNum)) {
        newHistory.push("    [!] Error: Debe ingresar un número entero válido.", "  > Ingrese la edad (1 - 120 años):");
      } else if (edadNum < 1 || edadNum > 120) {
        newHistory.push("    [!] Error: La edad debe estar estrictamente entre 1 y 120 años.", "  > Ingrese la edad (1 - 120 años):");
      } else {
        setTerminalPromptState({
          step: 'reg_sex',
          tempData: { ...terminalPromptState.tempData, edad: edadNum }
        });
        newHistory.push("  > Ingrese sexo (F = Femenino, M = Masculino, O = Otro):");
      }
    } else if (currStep === 'reg_sex') {
      const sexUpper = cmd.toUpperCase();
      if (!['F', 'M', 'O'].includes(sexUpper)) {
        newHistory.push("    [!] Ingrese una opción válida: F, M u O.", "  > Ingrese sexo (F = Femenino, M = Masculino, O = Otro):");
      } else {
        setTerminalPromptState({
          step: 'reg_corr',
          tempData: { ...terminalPromptState.tempData, sexo: sexUpper }
        });
        newHistory.push("  > ¿El paciente usa corrección visual? (Sí/No):");
      }
    } else if (currStep === 'reg_corr') {
      const afirmativas = ["si", "sí", "s", "true", "t", "1", "y", "yes"];
      const negativas = ["no", "n", "false", "f", "0"];
      const val = cmd.toLowerCase();

      if (afirmativas.includes(val) || negativas.includes(val)) {
        const usa = afirmativas.includes(val);
        const nuevo: Paciente = {
          id: terminalPromptState.tempData?.id || Date.now().toString(),
          nombre: terminalPromptState.tempData?.nombre || 'Sin nombre',
          edad: terminalPromptState.tempData?.edad || 20,
          sexo: terminalPromptState.tempData?.sexo || 'F',
          usa_correccion: usa,
        };

        const updated = [...pacientes, nuevo];
        setPacientes(updated);

        newHistory.push(
          "",
          "[ÉXITO] Paciente registrado satisfactoriamente en Optogestión.",
          `        ID: ${nuevo.id} | Nombre: ${nuevo.nombre} | Corrección: ${usa ? 'SÍ' : 'NO'}`,
          "[OK] Datos guardados automáticamente en 'pacientes.json'.",
          "",
          "----------------------------------------------",
          "              MENÚ PRINCIPAL                  ",
          "----------------------------------------------",
          "  1. Registrar paciente",
          "  2. Consultar paciente",
          "  3. Mostrar pacientes registrados",
          "  4. Buscar pacientes con corrección visual",
          "  5. Generar estadísticas",
          "  6. Salir",
          "----------------------------------------------",
          "  Seleccione una opción (1-6):"
        );
        setTerminalPromptState({ step: 'menu' });
      } else {
        newHistory.push(
          "    [!] Entrada inválida. Por favor responda 'Sí' (S) o 'No' (N).",
          "  > ¿El paciente usa corrección visual? (Sí/No):"
        );
      }
    } else if (currStep === 'consultar_id') {
      const match = pacientes.find(p => p.id === cmd);
      if (match) {
        newHistory.push(
          "",
          "---------------------------------------------",
          "            FICHA DEL PACIENTE               ",
          "---------------------------------------------",
          `  • Identificación:        ${match.id}`,
          `  • Nombre completo:       ${match.nombre}`,
          `  • Edad:                  ${match.edad} años`,
          `  • Sexo:                  ${match.sexo}`,
          `  • Usa Corrección Visual: ${match.usa_correccion ? 'Sí (requiere/usa lentes o gafas)' : 'No usa corrección'}`,
          "---------------------------------------------"
        );
      } else {
        newHistory.push(`\n[AVISO] No se encontró ningún paciente con el ID '${cmd}' en el sistema.`);
      }
      newHistory.push(
        "",
        "----------------------------------------------",
        "              MENÚ PRINCIPAL                  ",
        "----------------------------------------------",
        "  1. Registrar paciente",
        "  2. Consultar paciente",
        "  3. Mostrar pacientes registrados",
        "  4. Buscar pacientes con corrección visual",
        "  5. Generar estadísticas",
        "  6. Salir",
        "----------------------------------------------",
        "  Seleccione una opción (1-6):"
      );
      setTerminalPromptState({ step: 'menu' });
    }

    setTerminalHistory(newHistory);
  };

  // Agregar paciente desde GUI
  const handleAgregarPacienteGUI = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nuevoId.trim()) {
      setFormError('El documento / ID es obligatorio.');
      return;
    }
    if (pacientes.some(p => p.id === nuevoId.trim())) {
      setFormError(`Ya existe un paciente con el ID ${nuevoId.trim()}.`);
      return;
    }
    if (!nuevoNombre.trim()) {
      setFormError('El nombre completo es obligatorio.');
      return;
    }
    const edadNum = parseInt(nuevoEdad, 10);
    if (isNaN(edadNum) || edadNum < 1 || edadNum > 120) {
      setFormError('La edad debe ser un número entero entre 1 y 120 años.');
      return;
    }

    const nuevo: Paciente = {
      id: nuevoId.trim(),
      nombre: nuevoNombre.trim(),
      edad: edadNum,
      sexo: nuevoSexo,
      usa_correccion: nuevoCorreccion
    };

    setPacientes(prev => [...prev, nuevo]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddModal(false);
      setNuevoId('');
      setNuevoNombre('');
      setNuevoEdad('');
      setNuevoSexo('F');
      setNuevoCorreccion(true);
    }, 1200);
  };

  const handleEliminarPaciente = (id: string) => {
    if (confirm(`¿Desea eliminar el paciente con ID ${id}?`)) {
      setPacientes(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleResetearDatos = () => {
    if (confirm("¿Restablecer los 5 pacientes de prueba originales?")) {
      setPacientes(REGISTROS_INICIALES);
      localStorage.setItem('optogestion_pacientes', JSON.stringify(REGISTROS_INICIALES));
    }
  };

  // Descargas de archivos
  const descargarArchivo = (contenido: string, nombreArchivo: string, tipoMime: string) => {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Descargar script optogestion.py directamente
  const handleDescargarPython = async () => {
    try {
      const res = await fetch('/optogestion.py');
      if (res.ok) {
        const text = await res.text();
        descargarArchivo(text, 'optogestion.py', 'text/x-python');
      } else {
        window.open('/optogestion.py', '_blank');
      }
    } catch (e) {
      console.error(e);
      window.open('/optogestion.py', '_blank');
    }
  };

  // Copiar al portapapeles
  const copiarTexto = (texto: string, setCopiado: (val: boolean) => void) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Estadísticas calculadas
  const totalPacientes = pacientes.length;
  const edadPromedio = totalPacientes > 0
    ? (pacientes.reduce((acc, p) => acc + p.edad, 0) / totalPacientes).toFixed(1)
    : '0';
  const pacientesConCorreccion = pacientes.filter(p => p.usa_correccion);
  const porcentajeCorreccion = totalPacientes > 0
    ? ((pacientesConCorreccion.length / totalPacientes) * 100).toFixed(1)
    : '0';

  // Pacientes filtrados para la tabla
  const pacientesFiltrados = pacientes.filter(p => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.id.toLowerCase().includes(filtroTexto.toLowerCase());
    if (filtroCorreccion === 'con') return coincideTexto && p.usa_correccion;
    if (filtroCorreccion === 'sin') return coincideTexto && !p.usa_correccion;
    return coincideTexto;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner Institucional Universidad CES */}
      <header className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-b border-emerald-800/40 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                  Universidad CES • Medellín
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">Centro de Atención Optométrica</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Sistema Optogestión
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Consola & Panel Clínico
                </span>
              </h1>
            </div>
          </div>

          {/* Botones de acción / descargas */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDescargarPython}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-900/40"
              title="Descargar script de consola optogestion.py"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .py</span>
            </button>
            <button
              onClick={() => descargarArchivo(JSON.stringify(pacientes, null, 4), 'pacientes.json', 'application/json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
              title="Descargar base de datos pacientes.json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar .json</span>
            </button>
          </div>
        </div>

        {/* Barra de Pestañas (Solo Consola, Panel Visual y Base de Datos) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 flex overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-4 py-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              Consola Interactiva (CLI)
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Panel Visual & Pacientes
              <span className="text-xs bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded-full font-mono">
                {pacientes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'json'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-mono font-bold text-amber-400">{"{}"}</span>
              Base de Datos (pacientes.json)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ========================================================================= */}
        {/* TAB 1: CONSOLA INTERACTIVA (SIMULADOR DE TERMINAL PYTHON) */}
        {/* ========================================================================= */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5 text-emerald-400" />
                  Terminal Interactivo de Consola
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ejecuta en tiempo real el ciclo continuo y los módulos del programa de consola de Optogestión.
                </p>
              </div>

              {/* Botones de acción rápida en la consola */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Accesos Rápidos:</span>
                <button
                  onClick={() => {
                    setTerminalInput('1');
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  1. Registrar
                </button>
                <button
                  onClick={() => {
                    setTerminalInput('2');
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  2. Consultar
                </button>
                <button
                  onClick={() => {
                    setTerminalInput('3');
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  3. Mostrar todos
                </button>
                <button
                  onClick={() => {
                    setTerminalInput('4');
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  4. Con corrección
                </button>
                <button
                  onClick={() => {
                    setTerminalInput('5');
                    terminalInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                >
                  5. Estadísticas
                </button>
                <button
                  onClick={() => {
                    setTerminalHistory([
                      "=============================================================================",
                      "                 UNIVERSIDAD CES - MEDELLÍN                                  ",
                      "         Centro Universitario de Atención Optométrica                         ",
                      "               SISTEMA DE GESTIÓN 'OPTOGESTIÓN'                              ",
                      "=============================================================================",
                      `[OK] Se cargaron ${pacientes.length} pacientes exitosamente desde 'pacientes.json'.`,
                      "",
                      "----------------------------------------------",
                      "              MENÚ PRINCIPAL                  ",
                      "----------------------------------------------",
                      "  1. Registrar paciente",
                      "  2. Consultar paciente",
                      "  3. Mostrar pacientes registrados",
                      "  4. Buscar pacientes con corrección visual",
                      "  5. Generar estadísticas",
                      "  6. Salir",
                      "----------------------------------------------",
                      "  Seleccione una opción (1-6):",
                    ]);
                    setTerminalPromptState({ step: 'menu' });
                  }}
                  className="px-2.5 py-1 text-xs bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded border border-rose-800/60 transition ml-2"
                >
                  Limpiar Consola
                </button>
              </div>
            </div>

            {/* Ventana de Terminal */}
            <div className="bg-[#0b101b] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono flex flex-col h-[560px]">
              {/* Barra superior de terminal */}
              <div className="bg-[#121926] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="text-xs text-slate-400 font-sans ml-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ces-optometria@ces-virtual: ~/optogestion$ python3 optogestion.py
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  UTF-8 | Interactivo
                </div>
              </div>

              {/* Contenido de la consola */}
              <div className="flex-1 p-4 overflow-y-auto text-sm space-y-1 text-emerald-400 select-text leading-relaxed">
                {terminalHistory.map((line, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap ${
                      line.startsWith('>')
                        ? 'text-cyan-300 font-bold'
                        : line.startsWith('[!]') || line.startsWith('[ERROR]')
                        ? 'text-red-400'
                        : line.startsWith('[OK]') || line.startsWith('[ÉXITO]')
                        ? 'text-emerald-300 font-semibold'
                        : line.startsWith('[AVISO]') || line.startsWith('[INFO]')
                        ? 'text-amber-300'
                        : line.includes('UNIVERSIDAD CES') || line.includes('OPTOGESTIÓN')
                        ? 'text-teal-300 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Línea de entrada del usuario */}
              <form onSubmit={handleTerminalSubmit} className="bg-[#0d131f] p-3 border-t border-slate-800 flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">❯</span>
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder={
                    terminalPromptState.step === 'menu'
                      ? "Escriba 1, 2, 3, 4, 5 o 6 y presione Enter..."
                      : "Escriba su respuesta y presione Enter..."
                  }
                  className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder:text-slate-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-sans font-medium transition"
                >
                  Enviar
                </button>
              </form>
            </div>

            {/* Resumen de especificaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Estructura:</strong> Lista de diccionarios con claves <code>id</code>, <code>nombre</code>, <code>edad</code>, <code>sexo</code>, <code>usa_correccion</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Validaciones:</strong> Edad entre 1-120 años y corrección booleana traducida de Sí/No.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>División por cero:</strong> Estadísticas protegidas matemáticamente ante listas vacías.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PANEL VISUAL & PACIENTES (GUI COMPLETA) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Tarjetas de Estadísticas de la Jornada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tarjeta 1: Total Pacientes */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Pacientes</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{totalPacientes}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Registrados en la base</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Tarjeta 2: Edad Promedio */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Edad Promedio</p>
                  <p className="text-3xl font-extrabold text-teal-400 mt-1">{edadPromedio} <span className="text-sm font-normal text-slate-400">años</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {totalPacientes > 0
                      ? `Rango: ${Math.min(...pacientes.map(p => p.edad))} a ${Math.max(...pacientes.map(p => p.edad))} años`
                      : 'Sin datos'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>

              {/* Tarjeta 3: Con Corrección Visual */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Con Corrección</p>
                  <p className="text-3xl font-extrabold text-amber-400 mt-1">
                    {pacientesConCorreccion.length}
                    <span className="text-sm font-medium text-slate-400 ml-1.5">({porcentajeCorreccion}%)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Usa gafas o lentes de contacto</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Glasses className="w-6 h-6" />
                </div>
              </div>

              {/* Tarjeta 4: Sin Corrección */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sin Corrección</p>
                  <p className="text-3xl font-extrabold text-slate-200 mt-1">
                    {totalPacientes - pacientesConCorreccion.length}
                    <span className="text-sm font-medium text-slate-400 ml-1.5">
                      {totalPacientes > 0 ? (100 - parseFloat(porcentajeCorreccion)).toFixed(1) : '0'}%
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Visión emétrope / sin anteojos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Controles y Filtros */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    placeholder="Buscar paciente por nombre o documento/ID..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filtro de corrección */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    onClick={() => setFiltroCorreccion('todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filtroCorreccion === 'todos'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({pacientes.length})
                  </button>
                  <button
                    onClick={() => setFiltroCorreccion('con')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      filtroCorreccion === 'con'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Glasses className="w-3 h-3" />
                    Con corrección ({pacientesConCorreccion.length})
                  </button>
                  <button
                    onClick={() => setFiltroCorreccion('sin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filtroCorreccion === 'sin'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sin corrección ({pacientes.length - pacientesConCorreccion.length})
                  </button>
                </div>

                {/* Botón registrar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-md shadow-emerald-900/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Paciente</span>
                  </button>
                  <button
                    onClick={handleResetearDatos}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Restablecer 5 datos de prueba iniciales"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabla de Pacientes */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Documento / ID</th>
                      <th className="py-3 px-4">Nombre Completo</th>
                      <th className="py-3 px-4 text-center">Edad</th>
                      <th className="py-3 px-4 text-center">Sexo</th>
                      <th className="py-3 px-4 text-center">Usa Corrección Visual</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-normal">
                    {pacientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No se encontraron pacientes que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      pacientesFiltrados.map((paciente, index) => (
                        <tr key={paciente.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 text-slate-500 text-xs font-mono">{index + 1}</td>
                          <td className="py-3 px-4 font-mono font-medium text-emerald-400">{paciente.id}</td>
                          <td className="py-3 px-4 font-semibold text-white">{paciente.nombre}</td>
                          <td className="py-3 px-4 text-center text-slate-300">{paciente.edad} años</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              paciente.sexo === 'F'
                                ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50'
                                : paciente.sexo === 'M'
                                ? 'bg-blue-950/70 text-blue-300 border border-blue-800/50'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {paciente.sexo === 'F' ? 'Femenino' : paciente.sexo === 'M' ? 'Masculino' : 'Otro'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {paciente.usa_correccion ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                                <Glasses className="w-3.5 h-3.5" />
                                <span>Sí (Usa corrección)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
                                <Eye className="w-3.5 h-3.5" />
                                <span>No usa corrección</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => setSelectedPaciente(paciente)}
                              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition"
                            >
                              Ver Ficha
                            </button>
                            <button
                              onClick={() => handleEliminarPaciente(paciente.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                              title="Eliminar paciente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BASE DE DATOS (pacientes.json) */}
        {/* ========================================================================= */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold">{"{ }"}</span>
                  Archivo de Datos Persistente: <span className="text-amber-400 font-mono">pacientes.json</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estado actual de la base de datos local en formato JSON con los {pacientes.length} registros del sistema.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copiarTexto(JSON.stringify(pacientes, null, 4), setCopiadoJson)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  {copiadoJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiadoJson ? '¡Copiado!' : 'Copiar JSON'}</span>
                </button>
                <button
                  onClick={() => descargarArchivo(JSON.stringify(pacientes, null, 4), 'pacientes.json', 'application/json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar pacientes.json</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0b101b] rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl">
              <pre className="p-4 overflow-x-auto text-amber-300 leading-relaxed max-h-[600px] select-text">
                <code>{JSON.stringify(pacientes, null, 4)}</code>
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: REGISTRAR PACIENTE (GUI) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Módulo 1: Registrar Paciente
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ingrese los datos solicitados. La edad debe estar entre 1 y 120 años.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Paciente registrado y guardado exitosamente en el sistema!</span>
              </div>
            )}

            <form onSubmit={handleAgregarPacienteGUI} className="mt-4 space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID / Documento:
                </label>
                <input
                  type="text"
                  value={nuevoId}
                  onChange={(e) => setNuevoId(e.target.value)}
                  placeholder="Ej: 1006 o CC102030"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Camilo Echeverri Restrepo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Edad (1 - 120 años):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={nuevoEdad}
                    onChange={(e) => setNuevoEdad(e.target.value)}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sexo:
                  </label>
                  <select
                    value={nuevoSexo}
                    onChange={(e) => setNuevoSexo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="F">Femenino (F)</option>
                    <option value="M">Masculino (M)</option>
                    <option value="O">Otro (O)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ¿Usa corrección visual (gafas/lentes)?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNuevoCorreccion(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                      nuevoCorreccion
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Glasses className="w-3.5 h-3.5" />
                    <span>Sí (True)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevoCorreccion(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                      !nuevoCorreccion
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>No (False)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-900/40"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FICHA DE CONSULTA INDIVIDUAL */}
      {selectedPaciente && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Ficha del Paciente (ID {selectedPaciente.id})
              </h3>
              <button
                onClick={() => setSelectedPaciente(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Identificación:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedPaciente.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Nombre completo:</span>
                  <span className="font-semibold text-white">{selectedPaciente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Edad:</span>
                  <span className="text-slate-200">{selectedPaciente.edad} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Sexo:</span>
                  <span className="text-slate-200">
                    {selectedPaciente.sexo === 'F' ? 'Femenino' : selectedPaciente.sexo === 'M' ? 'Masculino' : 'Otro'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400">Corrección Visual:</span>
                  {selectedPaciente.usa_correccion ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Glasses className="w-3.5 h-3.5" />
                      Requiere / Usa lentes
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      No usa corrección
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedPaciente(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          Sistema Optogestión • Universidad CES • Centro Universitario de Atención Optométrica
        </p>
      </footer>
    </div>
  );
}

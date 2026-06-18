import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import "./TailwindApp.css";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function App() {
  // ---------------------------------------------------
  // Helpers / utilidades
  // ---------------------------------------------------
  function formatearFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  }

  // ---------------------------------------------------
  // Estado local
  // ---------------------------------------------------
  const [texto, setTexto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [inicioX, setInicioX] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const diasRef = useRef(null);
  const [isDraggingDias, setIsDraggingDias] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [tareas, setTareas] = useState(() => {
    const tareasGuardadas = localStorage.getItem("tareas");

    if (tareasGuardadas) {
      return JSON.parse(tareasGuardadas);
    }

    return [];
  });

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatearFecha(new Date()),
  );

  const [fechaActual, setFechaActual] = useState(new Date());

  // ---------------------------------------------------
  // Constantes de calendario
  // ---------------------------------------------------
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();
  const diasMes = [];
  const ultimoDia = new Date(año, mes + 1, 0).getDate();

  for (let dia = 1; dia <= ultimoDia; dia++) {
    diasMes.push(new Date(año, mes, dia));
  }

  // ---------------------------------------------------
  // Efectos secundarios
  // ---------------------------------------------------
  useEffect(() => {
    localStorage.setItem("tareas", JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    function cerrarConEscape(e) {
      if (e.key === "Escape") {
        setMostrarFormulario(false);
      }
    }

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  useEffect(() => {
    const contenedor = diasRef.current;

    if (!contenedor) return;

    const activo = contenedor.querySelector(".dia-activo");

    if (!activo) return;

    activo.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [fechaSeleccionada]);

  // ---------------------------------------------------
  // Acciones de tareas
  // ---------------------------------------------------
  function agregarTarea() {
    if (texto.trim() === "") {
      return;
    }

    const nuevaTarea = {
      id: Date.now(),
      texto,
      completada: false,
      fecha: fechaSeleccionada,
      fechaCreacion: formatearFecha(new Date()),
      fechaLimite: fechaLimite || null,
      orden: tareas.length, // 👈 IMPORTANTE
    };

    setTareas([...tareas, nuevaTarea]);
    setTexto("");
    setFechaLimite("");
    setMostrarFormulario(false);
  }

  function cambiarEstado(id) {
    const nuevasTareas = tareas.map((tarea) => {
      if (tarea.id === id) {
        return {
          ...tarea,
          completada: !tarea.completada,
        };
      }

      return tarea;
    });

    setTareas(nuevasTareas);
  }

  function borrarTarea(id) {
    const nuevasTareas = tareas.filter((tarea) => tarea.id !== id);
    setTareas(nuevasTareas);
  }

  function actualizarFechaLimite(id, nuevaFecha) {
    const nuevasTareas = tareas.map((tarea) => {
      if (tarea.id === id) {
        return {
          ...tarea,
          fechaLimite: nuevaFecha,
        };
      }

      return tarea;
    });

    setTareas(nuevasTareas);
  }

  function editarTarea(id) {
    const tareaActual = tareas.find((tarea) => tarea.id === id);
    const nuevoTexto = prompt("Editar tarea", tareaActual.texto);

    if (nuevoTexto === null || nuevoTexto.trim() === "") {
      return;
    }

    const nuevasTareas = tareas.map((tarea) => {
      if (tarea.id === id) {
        return {
          ...tarea,
          texto: nuevoTexto,
        };
      }

      return tarea;
    });

    setTareas(nuevasTareas);
  }

  function moverTarea(indexDestino) {
    if (draggedIndex === null || draggedIndex === indexDestino) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // draggedIndex and indexDestino are índices dentro de tareasDelDia
    const tareaOrigen = tareasDelDia[draggedIndex];
    const tareaDestino = tareasDelDia[indexDestino];

    const idxFrom = tareas.findIndex(
      (t) => t.id === (tareaOrigen ? tareaOrigen.id : null),
    );
    const idxTo = tareas.findIndex(
      (t) => t.id === (tareaDestino ? tareaDestino.id : null),
    );

    if (idxFrom === -1 || idxTo === -1) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const lista = [...tareas];
    const [item] = lista.splice(idxFrom, 1);
    lista.splice(idxTo, 0, item);

    // actualizar orden para que la vista respete la nueva posición
    const listaConOrden = lista.map((t, i) => ({ ...t, orden: i }));

    setTareas(listaConOrden);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  // ---------------------------------------------------
  // Navegación de calendario
  // ---------------------------------------------------
  function mesAnterior() {
    const diaActual = new Date(fechaSeleccionada).getDate();
    const nuevaFechaBase = new Date(año, mes - 1, 1);
    const nuevoAño = nuevaFechaBase.getFullYear();
    const nuevoMes = nuevaFechaBase.getMonth();
    const ultimoDiaNuevoMes = new Date(nuevoAño, nuevoMes + 1, 0).getDate();
    const diaFinal = Math.min(diaActual, ultimoDiaNuevoMes);
    const nuevaFecha = new Date(nuevoAño, nuevoMes, diaFinal);

    setFechaActual(nuevaFecha);
    setFechaSeleccionada(formatearFecha(nuevaFecha));
  }

  function mesSiguiente() {
    const diaActual = new Date(fechaSeleccionada).getDate();
    const nuevaFechaBase = new Date(año, mes + 1, 1);
    const nuevoAño = nuevaFechaBase.getFullYear();
    const nuevoMes = nuevaFechaBase.getMonth();
    const ultimoDiaNuevoMes = new Date(nuevoAño, nuevoMes + 1, 0).getDate();
    const diaFinal = Math.min(diaActual, ultimoDiaNuevoMes);
    const nuevaFecha = new Date(nuevoAño, nuevoMes, diaFinal);

    setFechaActual(nuevaFecha);
    setFechaSeleccionada(formatearFecha(nuevaFecha));
  }

  function siguienteDia() {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + 1);
    setFechaSeleccionada(formatearFecha(fecha));
    setFechaActual(fecha);
  }

  function diaAnterior() {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() - 1);
    setFechaSeleccionada(formatearFecha(fecha));
    setFechaActual(fecha);
  }

  function seleccionarFecha(fechaTexto) {
    setFechaSeleccionada(fechaTexto);
    setFechaActual(new Date(fechaTexto));
    setMostrarCalendario(false);
  }

  // Funciones para arrastrar el calendario de días
  function iniciarArrastre(e) {
    if (!diasRef.current) return;

    setIsDraggingDias(true);

    const clientX = e.touches ? e.touches[0].pageX : e.pageX;

    setStartX(clientX - diasRef.current.offsetLeft);
    setScrollLeft(diasRef.current.scrollLeft);
  }

  function moverArrastre(e) {
    if (!isDraggingDias || !diasRef.current) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].pageX : e.pageX;

    const x = clientX - diasRef.current.offsetLeft;
    const distancia = (x - startX) * 1.5;

    diasRef.current.scrollLeft = scrollLeft - distancia;
  }

  function terminarArrastre() {
    setIsDraggingDias(false);
  }

  // ---------------------------------------------------
  // Datos derivados
  // ---------------------------------------------------
  const tareasOrdenadas = [...tareas].sort((a, b) => a.orden - b.orden);
  const tareasDelDia = tareasOrdenadas.filter((tarea) => {
    if (tarea.completada) {
      return tarea.fecha === fechaSeleccionada;
    }
    return tarea.fecha <= fechaSeleccionada;
  });
  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-5 py-6">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-700">
        Mis tareas
      </h1>

      <div className="cabecera-mes relative mb-4 flex items-center justify-center rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        {" "}
        <div className="flex items-center gap-4">
          <button
            className="rounded-full bg-teal-200 p-3 text-slate-700 transition hover:scale-105 hover:bg-teal-300"
            onClick={mesAnterior}
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="titulo-mes min-w-[170px] text-center text-xl font-semibold text-slate-700">
            {meses[mes]} {año}
          </h2>

          <button
            className="rounded-full bg-teal-200 p-3 text-slate-700 transition hover:scale-105 hover:bg-teal-300"
            onClick={mesSiguiente}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={() => setMostrarCalendario(!mostrarCalendario)}
          className="
  absolute right-5 top-1/2
  -translate-y-1/2

  flex h-11 w-11 items-center justify-center

  rounded-full bg-slate-100
  text-slate-600 shadow-sm

  transition-all duration-200
  hover:scale-105 hover:bg-sky-100
  hover:text-teal-600
  active:scale-95
"
          aria-label="Abrir calendario"
        >
          <CalendarDays size={20} />
        </button>
      </div>
      <div
        className={`
    transition-all duration-300 ease-out

    ${
      mostrarCalendario
        ? "max-h-24 opacity-100 mb-4 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-2"
    }
  `}
      >
        <div className="flex justify-center pt-2">
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => seleccionarFecha(e.target.value)}
            className="
            cursor-grab active:cursor-grabbing
        rounded-2xl border border-slate-200
        bg-white px-4 py-3
        text-slate-700 shadow-md
        outline-none

        transition-all duration-200

        focus:border-teal-300
        focus:ring-4 focus:ring-teal-100
      "
          />
        </div>
      </div>

      <div
        ref={diasRef}
        className="
    mb-4 flex justify-start gap-3 overflow-x-auto
    rounded-3xl border border-slate-200
    bg-white/80 p-3 shadow-sm backdrop-blur-sm
    snap-x snap-mandatory scroll-smooth
    [scrollbar-width:none]
    [-ms-overflow-style:none]
    [&::-webkit-scrollbar]:hidden
  "
        onMouseDown={iniciarArrastre}
        onMouseMove={moverArrastre}
        onMouseUp={terminarArrastre}
        onMouseLeave={terminarArrastre}
        onTouchStart={iniciarArrastre}
        onTouchMove={moverArrastre}
        onTouchEnd={terminarArrastre}
      >
        <div className="shrink-0 w-[calc(50%-32px)]" />
        {diasMes.map((fecha) => {
          const fechaTexto = formatearFecha(fecha);

          const tieneTareas = tareas.some(
            (tarea) => tarea.fecha === fechaTexto,
          );

          return (
            <button
              key={fechaTexto}
              draggable={false}
              className={`dia-item shrink-0 snap-center flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2 transition-all duration-200 ${
                fechaTexto === fechaSeleccionada
                  ? "dia-activo scale-105 bg-teal-200 shadow-sm"
                  : "bg-slate-50 hover:-translate-y-1 hover:bg-slate-100"
              }`}
              onClick={() => seleccionarFecha(fechaTexto)}
            >
              <span className="dia-semana">{diasSemana[fecha.getDay()]}</span>

              <span className="dia-numero">{fecha.getDate()}</span>

              {tieneTareas && <span className="indicador-dia"></span>}
            </button>
          );
        })}
        <div className="shrink-0 w-[calc(50%-32px)]" />
      </div>
      <div className="zona-scroll">
        <ul>
          <AnimatePresence mode="popLayout">
            {tareasDelDia.map((tarea, index) => (
              <motion.li
                key={tarea.id}
                layout
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className={`tarea ${draggedIndex === index ? "dragging" : ""} ${
                  dragOverIndex === index ? "drag-over" : ""
                }`}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => moverTarea(index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
              >
                <span className="check" onClick={() => cambiarEstado(tarea.id)}>
                  <span
                    className={tarea.completada ? "circle done" : "circle"}
                  />
                </span>

                <div
                  className="contenido-tarea"
                  onClick={() => cambiarEstado(tarea.id)}
                >
                  <span
                    className={`text-base font-medium ${
                      tarea.completada
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {tarea.texto}
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    Creada: {tarea.fechaCreacion || "Desconocida"}
                  </span>

                  {tarea.fechaLimite && (
                    <span className="mt-1 text-xs font-medium text-cyan-600">
                      <CalendarDays size={14} />
                      {new Date(tarea.fechaLimite).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => editarTarea(tarea.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-teal-500"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => borrarTarea(tarea.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <motion.button
        className="boton-flotante fixed bottom-6 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-teal-300 text-4xl text-white shadow-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMostrarFormulario(true)}
      >
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>

      {mostrarFormulario && (
        <div
          className="modal fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={() => setMostrarFormulario(false)}
        >
          <div
            className="
    animar-modal
    flex flex-col gap-6
    w-full max-w-md
    rounded-3xl
    border border-slate-200/80
    bg-white
    p-6
    shadow-[0_20px_60px_rgba(15,23,42,0.15)]
  "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-center text-xl font-semibold text-slate-700">
              Nueva tarea
            </h3>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Escribe una tarea"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="
          w-full rounded-2xl border border-slate-200
          bg-slate-50 px-4 py-3
          text-slate-700 placeholder:text-slate-400
          outline-none transition-all duration-200
          focus:border-teal-300 focus:bg-white
          focus:ring-4 focus:ring-teal-100
        "
              />

              <input
                type="date"
                min={formatearFecha(new Date())}
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="
          w-full rounded-2xl border border-slate-200
          bg-slate-50 px-4 py-3
          text-slate-600
          outline-none transition-all duration-200
          focus:border-sky-300 focus:bg-white
          focus:ring-4 focus:ring-sky-100
        "
              />
            </div>

            <div className="mt-2 flex justify-end gap-4">
              <button
                onClick={() => {
                  setTexto("");
                  setFechaLimite("");
                  setMostrarFormulario(false);
                }}
                className="
          rounded-2xl bg-slate-100 px-5 py-3
          font-medium text-slate-600
          transition-all duration-200
          hover:bg-slate-200
          active:scale-95
        "
              >
                Cancelar
              </button>

              <button
                onClick={agregarTarea}
                className="
          rounded-2xl bg-gradient-to-r
          from-teal-300 to-sky-300
          px-5 py-3
          font-medium text-slate-700
          shadow-lg shadow-teal-200/50
          transition-all duration-200
          hover:scale-105 hover:shadow-xl
          active:scale-95
        "
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

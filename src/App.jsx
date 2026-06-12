import { useState, useEffect } from "react";
import "./App.css";

function App() {
  function formatearFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  }

  const [texto, setTexto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [inicioX, setInicioX] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

  const indiceActual = diasMes.findIndex((fecha) => {
    return formatearFecha(fecha) === fechaSeleccionada;
  });

  const inicio = Math.max(0, indiceActual - 2);
  const fin = Math.min(diasMes.length, inicio + 5);

  const diasVisibles = diasMes.slice(inicio, fin);

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
    const nuevasTareas = tareas.filter((tarea) => {
      return tarea.id !== id;
    });

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
    const tareaActual = tareas.find((tarea) => {
      return tarea.id === id;
    });

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

  const tareasDelDia = tareas.filter((tarea) => {
    if (tarea.completada) {
      return tarea.fecha === fechaSeleccionada;
    }

    return tarea.fecha <= fechaSeleccionada;
  });

  return (
    <main>
      <h1>App Notas Checklist</h1>

      <div className="cabecera-mes">
        <button onClick={mesAnterior}>◀</button>

        <h2 className="titulo-mes">
          {meses[mes]} {año}
        </h2>

        <button onClick={mesSiguiente}>▶</button>
      </div>

      <div
        className="dias"
        onTouchStart={(e) => {
          setInicioX(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          const finX = e.changedTouches[0].clientX;

          if (inicioX - finX > 50) {
            siguienteDia();
          }

          if (finX - inicioX > 50) {
            diaAnterior();
          }
        }}
        onMouseDown={(e) => {
          setInicioX(e.clientX);
        }}
        onMouseUp={(e) => {
          const finX = e.clientX;

          if (inicioX - finX > 50) {
            siguienteDia();
          }

          if (finX - inicioX > 50) {
            diaAnterior();
          }
        }}
      >
        {diasVisibles.map((fecha) => {
          const fechaTexto = formatearFecha(fecha);

          const tieneTareas = tareas.some((tarea) => {
            return tarea.fecha === fechaTexto;
          });

          return (
            <button
              key={fechaTexto}
              className={fechaTexto === fechaSeleccionada ? "dia-activo" : ""}
              onClick={() => setFechaSeleccionada(fechaTexto)}
            >
              <span className="dia-semana">{diasSemana[fecha.getDay()]}</span>

              <span className="dia-numero">{fecha.getDate()}</span>

              {tieneTareas && <span className="indicador-dia"></span>}
            </button>
          );
        })}
      </div>

      <ul>
        {tareasDelDia.map((tarea) => (
          <li key={tarea.id} className="tarea">
            <span className="check" onClick={() => cambiarEstado(tarea.id)}>
              <span className={tarea.completada ? "circle done" : "circle"} />
            </span>

            <div className="contenido-tarea">
              <span className={tarea.completada ? "texto done" : "texto"}>
                {tarea.texto}
              </span>

              <span className="fecha-creacion">
                Creada: {tarea.fechaCreacion || "Desconocida"}
              </span>

              {tarea.fechaLimite && (
                <span className="fecha-limite">
                  📅 {new Date(tarea.fechaLimite).toLocaleDateString("es-ES")}
                </span>
              )}
            </div>

            <button onClick={() => editarTarea(tarea.id)}>✏️</button>
            <button onClick={() => borrarTarea(tarea.id)}>🗑</button>
          </li>
        ))}
      </ul>
      <button
        className="boton-flotante"
        onClick={() => setMostrarFormulario(true)}
      >
        +
      </button>
      {mostrarFormulario && (
        <div className="modal" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva tarea</h3>

            <input
              type="text"
              placeholder="Escribe una tarea"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />

            <input
              type="date"
              min={formatearFecha(new Date())}
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />

            <div className="modal-botones">
              <button
                onClick={() => {
                  setTexto("");
                  setFechaLimite("");
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>

              <button onClick={agregarTarea}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

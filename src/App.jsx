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

  function agregarTarea() {
    if (texto.trim() === "") {
      return;
    }

    const nuevaTarea = {
      id: Date.now(),
      texto: texto,
      completada: false,
      fecha: fechaSeleccionada,
    };

    setTareas([...tareas, nuevaTarea]);
    setTexto("");
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

  const tareasDelDia = tareas.filter((tarea) => {
    return tarea.fecha === fechaSeleccionada;
  });

  return (
    <main>
      <h1>App Notas Checklist</h1>

      <div className="cabecera-mes">
        <button onClick={mesAnterior}>◀</button>

        <h2>
          {meses[mes]} {año}
        </h2>

        <button onClick={mesSiguiente}>▶</button>
      </div>

      <div className="dias">
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

      <input
        type="text"
        placeholder="Escribe una tarea"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            agregarTarea();
          }
        }}
      />

      <button onClick={agregarTarea}>Añadir</button>

      <ul>
        {tareasDelDia.map((tarea) => (
          <li key={tarea.id} className="tarea">
            <span className="check" onClick={() => cambiarEstado(tarea.id)}>
              <span className={tarea.completada ? "circle done" : "circle"} />
            </span>

            <span className={tarea.completada ? "texto done" : "texto"}>
              {tarea.texto}
            </span>

            <button onClick={() => borrarTarea(tarea.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;

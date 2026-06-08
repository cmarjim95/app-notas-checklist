import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [texto, setTexto] = useState("");
  const [tareas, setTareas] = useState(() => {
    const tareasGuardadas = localStorage.getItem("tareas");

    if (tareasGuardadas) {
      return JSON.parse(tareasGuardadas);
    }

    return [];
  });

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

  return (
    <main>
      <h1>App Notas Checklist</h1>

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
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            <span
              className={tarea.completada ? "completada" : ""}
              onClick={() => cambiarEstado(tarea.id)}
            >
              {tarea.completada ? "☑ " : "□ "}
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

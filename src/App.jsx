import { useState } from "react";

function App() {
  const [texto, setTexto] = useState("");
  const [tareas, setTareas] = useState([]);

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

  return (
    <main>
      <h1>App Notas Checklist</h1>

      <input
        type="text"
        placeholder="Escribe una tarea"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button onClick={agregarTarea}>Añadir</button>

      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id} onClick={() => cambiarEstado(tarea.id)}>
            {tarea.completada ? "☑ " : "□ "}
            {tarea.texto}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;

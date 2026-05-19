import { useEffect, useState } from "react"

function App() {
  const [task, setTask] = useState("")
  const [priority, setPriority] = useState("Media")
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (!savedTasks) return []

    try {
      return JSON.parse(savedTasks)
    } catch (error) {
      console.error("Error parsing saved tasks:", error)
      localStorage.removeItem("tasks")
      return []
    }
  })
  const [user, setUser] = useState(() => localStorage.getItem("user") || "")
  const [nameInput, setNameInput] = useState(() => localStorage.getItem("user") || "")
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingTaskText, setEditingTaskText] = useState("")
  const [editingTaskPriority, setEditingTaskPriority] = useState("Media")
  const [sortMode, setSortMode] = useState("date")

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (user) localStorage.setItem("user", user)
    else localStorage.removeItem("user")
  }, [user])

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const clearUser = () => {
    setUser("")
    setNameInput("")
    localStorage.removeItem("user")
  }

  const startEdit = (taskToEdit) => {
    setEditingTaskId(taskToEdit.id)
    setEditingTaskText(taskToEdit.text)
    setEditingTaskPriority(taskToEdit.priority)
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditingTaskText("")
    setEditingTaskPriority("Media")
  }

  const saveEdit = (id) => {
    if (editingTaskText.trim() === "") return

    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, text: editingTaskText.trim(), priority: editingTaskPriority }
          : t
      )
    )
    cancelEdit()
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortMode === "priority") {
      const order = { Alta: 1, Media: 2, Baja: 3 }
      return order[a.priority] - order[b.priority] || b.createdAt - a.createdAt
    }
    return b.createdAt - a.createdAt
  })

  const addTask = () => {
    if (task.trim() === "") return

    const newTask = {
      id: Date.now(),
      text: task.trim(),
      done: false,
      createdAt: Date.now(),
      date: new Date().toLocaleDateString(),
      priority
    }

    setTasks([...tasks, newTask])
    setTask("")
    setPriority("Media")
  }

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    )
  }

  return (
    <div style={styles.page}>
      
      {/* IZQUIERDA */}
      <div style={styles.leftPanel}>
        
        <div style={styles.card}>
          {user ? (
            <>
              <div style={styles.headerRow}>
                <div>
                  <h1>Hola, {user}</h1>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={clearUser} style={styles.smallButton}>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Bienvenido</h1>
              <p>Ingresa tu nombre para guardar tu sesión</p>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tu nombre"
                style={styles.input}
              />
              <button
                onClick={() => { if (nameInput.trim()) setUser(nameInput.trim()) }}
                style={styles.button}
              >
                Guardar usuario
              </button>
            </>
          )}
        </div>

        <div style={styles.card}>
          <h2>Tareas pendientes</h2>
          {tasks.filter((t) => !t.done).length === 0 ? (
            <p>No hay tareas pendientes</p>
          ) : (
            tasks.filter((t) => !t.done).map((t) => (
              <p key={t.id}>• {t.text}</p>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h2>Añadir tarea</h2>

          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Nueva tarea"
            style={styles.input}
          />

          <label style={styles.label}>
            Prioridad:
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </label>

          <button onClick={addTask} style={styles.button}>
            Añadir
          </button>
        </div>

      </div>

      {/* DERECHA */}
      <div style={styles.rightPanel}>
        <div style={styles.sortRow}>
          <h2>Lista del día</h2>
          <label style={styles.label}>
            Ordenar:
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              style={styles.select}
            >
              <option value="date">Fecha</option>
              <option value="priority">Prioridad</option>
            </select>
          </label>
        </div>

        {sortedTasks.length === 0 ? (
          <p>No hay tareas. Agrega una arriba.</p>
        ) : (
          sortedTasks.map((t) => (
            <div key={t.id} style={styles.ticket}>
              {editingTaskId === t.id ? (
                <>
                  <input
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    style={styles.input}
                  />
                  <label style={styles.label}>
                    Prioridad:
                    <select
                      value={editingTaskPriority}
                      onChange={(e) => setEditingTaskPriority(e.target.value)}
                      style={styles.select}
                    >
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baja</option>
                    </select>
                  </label>
                  <div style={styles.buttonRow}>
                    <button onClick={() => saveEdit(t.id)} style={styles.button}>
                      Guardar
                    </button>
                    <button onClick={cancelEdit} style={styles.secondaryButton}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.taskRow}>
                    <label style={{
                      textDecoration: t.done ? "line-through" : "none",
                      flex: 1
                    }}>
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTask(t.id)}
                      />
                      {t.text}
                    </label>
                    <div>
                      <button
                        onClick={() => startEdit(t)}
                        style={styles.smallButton}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        style={styles.smallButton}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                  <div style={styles.metaRow}>
                    <span>Prioridad: {t.priority}</span>
                    <span>{t.date}</span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}

const styles = {
  page: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    fontFamily: "Arial",
    background: "#f2e6d9",
    height: "100vh"
  },

  leftPanel: {
    width: "40%",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  rightPanel: {
    width: "60%",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    overflowY: "auto"
  },

  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },

  input: {
    width: "100%",
    padding: "8px",
    marginTop: "10px"
  },

  button: {
    marginTop: "10px",
    padding: "8px 12px",
    cursor: "pointer"
  },

  ticket: {
    padding: "10px",
    borderBottom: "1px solid #ddd"
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },

  sortRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px"
  },

  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "8px",
    fontSize: "0.9rem",
    color: "#555"
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "10px",
    fontSize: "0.95rem"
  },

  select: {
    width: "100%",
    padding: "8px",
    marginTop: "4px"
  },

  smallButton: {
    marginTop: "10px",
    padding: "6px 10px",
    cursor: "pointer",
    border: "1px solid #999",
    background: "#fff"
  },

  secondaryButton: {
    marginTop: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "#eee",
    border: "1px solid #ccc"
  }
}

export default App
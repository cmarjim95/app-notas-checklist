import { useState } from 'react';
import '../styles/ChecklistDay.css';

export function ChecklistDay({ date, items, onToggle, onDelete, onAddItem, onPrevDay, onNextDay }) {
  const [inputValue, setInputValue] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');

  const handleAddItem = () => {
    if (inputValue.trim()) {
      onAddItem(inputValue, deadlineValue || null);
      setInputValue('');
      setDeadlineValue('');
    }
  };

  const isDeadlineOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date(date);
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCreatedDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="checklist-day">
      <div className="day-title-row">
        <button type="button" className="day-nav-btn" onClick={onPrevDay}>
          ←
        </button>
        <h2 className="day-title">{formatDate(date)}</h2>
        <button type="button" className="day-nav-btn" onClick={onNextDay}>
          →
        </button>
      </div>

      <div className="add-item-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder="Agregar nueva tarea..."
          className="input-text"
        />
        <input
          type="date"
          value={deadlineValue}
          onChange={(e) => setDeadlineValue(e.target.value)}
          className="input-deadline"
        />
        <button onClick={handleAddItem} className="btn-add">
          Agregar
        </button>
      </div>

      <div className="items-list">
        {items.length === 0 ? (
          <p className="empty-message">No hay tareas para hoy</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`item ${item.completed[date] ? 'completed' : ''} ${
                isDeadlineOverdue(item.deadline) ? 'overdue' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed[date] || false}
                onChange={() => onToggle(item.id, date)}
                className="checkbox"
              />
              <div className="item-content">
                <span className="item-text">{item.text}</span>
                <div className="item-meta">
                  <span className="created-date">
                    Creada: {formatCreatedDate(item.createdDate)}
                  </span>
                  {item.deadline && (
                    <span
                      className={`deadline ${
                        isDeadlineOverdue(item.deadline) ? 'overdue-text' : ''
                      }`}
                    >
                      Vence: {formatCreatedDate(item.deadline)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="btn-delete"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

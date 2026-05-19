import { useEffect, useRef, useState } from 'react';
import '../styles/ChecklistDay.css';

export function ChecklistDay({ date, items, onToggle, onDelete, onAddItem, onPrevDay, onNextDay }) {
  const [inputValue, setInputValue] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);
  const [deadlineMonth, setDeadlineMonth] = useState(new Date().getMonth());
  const [deadlineYear, setDeadlineYear] = useState(new Date().getFullYear());
  const deadlinePickerRef = useRef(null);

  useEffect(() => {
    const closeOnClickOutside = (event) => {
      if (deadlinePickerRef.current && !deadlinePickerRef.current.contains(event.target)) {
        setDeadlinePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, []);

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

  const formatInputDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const openDeadlinePicker = () => setDeadlinePickerOpen(true);
  const closeDeadlinePicker = () => setDeadlinePickerOpen(false);

  const changeDeadlineMonth = (increment) => {
    const nextDate = new Date(deadlineYear, deadlineMonth + increment, 1);
    setDeadlineMonth(nextDate.getMonth());
    setDeadlineYear(nextDate.getFullYear());
  };

  const buildDeadlineDays = () => {
    const firstOfMonth = new Date(deadlineYear, deadlineMonth, 1);
    const firstDayIndex = (firstOfMonth.getDay() + 6) % 7; // Lunes primero
    const daysInMonth = new Date(deadlineYear, deadlineMonth + 1, 0).getDate();
    const days = Array.from({ length: firstDayIndex }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(deadlineYear, deadlineMonth, day));
    }

    return days;
  };

  const selectDeadlineDate = (date) => {
    const formatted = date.toISOString().slice(0, 10);
    setDeadlineValue(formatted);
    setDeadlinePickerOpen(false);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

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
        <div className="deadline-picker-wrapper" ref={deadlinePickerRef}>
          <button
            type="button"
            className="input-deadline deadline-button"
            onClick={openDeadlinePicker}
          >
            {deadlineValue ? formatInputDate(deadlineValue) : 'Fecha de vencimiento'}
          </button>

          {deadlinePickerOpen && (
            <div className="deadline-picker">
              <div className="deadline-picker-header">
                <button type="button" onClick={() => changeDeadlineMonth(-1)}>‹</button>
                <span>{monthNames[deadlineMonth]} {deadlineYear}</span>
                <button type="button" onClick={() => changeDeadlineMonth(1)}>›</button>
              </div>
              <div className="deadline-weekdays">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <div className="deadline-days-grid">
                {buildDeadlineDays().map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`deadline-day ${day && day.toISOString().slice(0, 10) === deadlineValue ? 'selected' : ''}`}
                    onClick={() => day && selectDeadlineDate(day)}
                    disabled={!day}
                  >
                    {day ? day.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
              <input
                type="checkbox"
                checked={item.completed[date] || false}
                onChange={() => onToggle(item.id, date)}
                className="checkbox"
                aria-label={`Marcar ${item.text} como completado`}
              />
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

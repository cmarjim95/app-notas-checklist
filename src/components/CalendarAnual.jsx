import { useState } from 'react';
import '../styles/CalendarAnual.css';

export function CalendarAnual({ items, selectedDate, onSelectDate, onGoToToday }) {
  const [year, setYear] = useState(new Date().getFullYear());

  // Función para convertir una fecha local a string ISO (YYYY-MM-DD)
  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCompletionRate = (date) => {
    const dateStr = dateToString(date);
    const itemsForDay = items.filter(
      item => 
        item.createdDate <= dateStr && 
        item.completed[dateStr] !== undefined
    );
    
    if (itemsForDay.length === 0) return null;
    
    const completed = itemsForDay.filter(item => item.completed[dateStr]).length;
    return Math.round((completed / itemsForDay.length) * 100);
  };

  const renderMonth = (month) => {
    const monthDate = new Date(year, month, 1);
    const firstDay = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Dias vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return dateToString(date) === selectedDate;
  };

  return (
    <div className="calendar-annual">
      <div className="calendar-header">
        <button onClick={() => setYear(year - 1)}>← {year}</button>
        <h2>{year}</h2>
        <button onClick={onGoToToday}>Hoy</button>
        <button onClick={() => setYear(year + 1)}>{year} →</button>
      </div>

      <div className="months-grid">
        {months.map((monthName, monthIndex) => (
          <div key={monthIndex} className="month-card">
            <h3>{monthName}</h3>
            <div className="month-grid">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                <div key={day} className="weekday-header">
                  {day}
                </div>
              ))}
              {renderMonth(monthIndex).map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="day-empty"></div>;
                }

                const completion = getCompletionRate(date);
                const dateStr = dateToString(date);

                return (
                  <button
                    key={dateStr}
                    className={`day-cell ${isToday(date) ? 'today' : ''} ${
                      isSelected(date) ? 'selected' : ''
                    }`}
                    onClick={() => onSelectDate(dateStr)}
                    title={date.toLocaleDateString('es-ES')}
                  >
                    <span className="day-number">{date.getDate()}</span>
                    {completion !== null && (
                      <span
                        className="completion-indicator"
                        style={{
                          backgroundColor: `hsl(${
                            completion * 1.2
                          }, 70%, 60%)`,
                        }}
                      >
                        {completion}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

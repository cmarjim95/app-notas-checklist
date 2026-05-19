import { useState } from 'react';
import { useChecklistStorage } from './hooks/useChecklistStorage';
import { ChecklistDay } from './components/ChecklistDay';
import { CalendarAnual } from './components/CalendarAnual';
import './App.css';

// Función helper para obtener fecha actual como string YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const { items, addItem, toggleItem, deleteItem, getItemsForDate } = useChecklistStorage();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [view, setView] = useState('checklist'); // 'checklist' o 'calendar'

  const itemsForSelectedDate = getItemsForDate(selectedDate);

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setView('checklist');
  };

  const handleGoToToday = () => {
    const today = getTodayString();
    setSelectedDate(today);
    setView('checklist');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Mi Checklist</h1>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'checklist' ? 'active' : ''}`}
            onClick={handleGoToToday}
          >
            LISTA
          </button>
          <button
            className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            CALENDARIO
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'checklist' ? (
          <ChecklistDay
            date={selectedDate}
            items={itemsForSelectedDate}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onAddItem={addItem}
          />
        ) : (
          <CalendarAnual
            items={items}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onGoToToday={handleGoToToday}
          />
        )}
      </main>
    </div>
  );
}

export default App;
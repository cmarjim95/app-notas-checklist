import { useState } from 'react';
import { useChecklistStorage } from './hooks/useChecklistStorage';
import { ChecklistDay } from './components/ChecklistDay';
import { CalendarAnual } from './components/CalendarAnual';
import { Pizarra } from './components/CanvasDraw';
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
  const [activeTab, setActiveTab] = useState('checklist');

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

  const changeSelectedDate = (offset) => {
    const current = new Date(`${selectedDate}T00:00:00`);
    current.setDate(current.getDate() + offset);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Mi Checklist</h1>
        <div className="tab-toggle">
          <button
            className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            Checklist
          </button>
          <button
            className={`tab-btn ${activeTab === 'pizarra' ? 'active' : ''}`}
            onClick={() => setActiveTab('pizarra')}
          >
            Pizarra
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'checklist' ? (
          <>
            <div className="subview-toggle">
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

            {view === 'checklist' ? (
              <ChecklistDay
                date={selectedDate}
                items={itemsForSelectedDate}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onAddItem={addItem}
                onPrevDay={() => changeSelectedDate(-1)}
                onNextDay={() => changeSelectedDate(1)}
              />
            ) : (
              <CalendarAnual
                items={items}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onGoToToday={handleGoToToday}
              />
            )}
          </>
        ) : (
          <Pizarra />
        )}
      </main>
    </div>
  );
}

export default App;
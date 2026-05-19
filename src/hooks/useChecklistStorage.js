import { useState, useEffect } from 'react';

// Función helper para obtener fecha actual como string YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función helper para restar un día a una fecha en string
const subtractOneDay = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
};

export function useChecklistStorage() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('checklistItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('checklistItems', JSON.stringify(items));
  }, [items]);

  const addItem = (text, deadline = null) => {
    const today = getTodayString();
    const newItem = {
      id: Date.now(),
      text,
      createdDate: today,
      deadline,
      completed: { [today]: false }, // {YYYY-MM-DD: boolean}
    };
    setItems([...items, newItem]);
  };

  const toggleItem = (id, date) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          completed: {
            ...item.completed,
            [date]: !item.completed[date],
          },
        };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Obtener items para un día específico
  const getItemsForDate = (dateStr) => {
    const yesterdayStr = subtractOneDay(dateStr);

    return items
      .map(item => {
        // Si el item no está completado en la fecha anterior, mostrarlo hoy
        if (!item.completed[yesterdayStr] && item.createdDate <= yesterdayStr) {
          return {
            ...item,
            completed: {
              ...item.completed,
              [dateStr]: item.completed[dateStr] ?? false,
            },
          };
        }

        // Si se creó hoy o antes, mostrar si no está completado hoy
        if (item.createdDate <= dateStr) {
          return {
            ...item,
            completed: {
              ...item.completed,
              [dateStr]: item.completed[dateStr] ?? false,
            },
          };
        }

        return null;
      })
      .filter(item => item !== null && item.completed[dateStr] !== undefined);
  };

  return { items, addItem, toggleItem, deleteItem, getItemsForDate };
}

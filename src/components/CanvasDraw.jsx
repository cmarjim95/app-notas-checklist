import { useEffect, useRef, useState } from 'react';
import '../styles/CanvasDraw.css';

const STORAGE_KEY = 'pizarraScreenshots';

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function Pizarra() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [snapshotsByDate, setSnapshotsByDate] = useState({});
  const [previewSnapshotId, setPreviewSnapshotId] = useState(null);

  const setupCanvas = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    return ctx;
  };

  const loadSnapshots = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const saveSnapshotsToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupCanvas(canvas);
    setSnapshotsByDate(loadSnapshots());

    const handleResize = () => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setupCanvas(canvas);
      const newCtx = canvas.getContext('2d');
      newCtx.putImageData(imageData, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = setTimeout(() => setSaveMessage(''), 2400);
    return () => clearTimeout(timeout);
  }, [saveMessage]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const drawLine = ({ x, y }) => {
    const ctx = getCanvasContext();
    if (!ctx || !lastPoint) return;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPoint({ x, y });
  };

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    canvas.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const handlePointerMove = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    drawLine({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas(canvas);
  };

  const handleSaveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const today = getTodayString();
    const image = canvas.toDataURL('image/png');
    const newSnapshot = {
      id: `${today}-${Date.now()}`,
      image,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...snapshotsByDate,
      [today]: [newSnapshot, ...(snapshotsByDate[today] || [])],
    };

    setSnapshotsByDate(updated);
    saveSnapshotsToStorage(updated);
    setSaveMessage('Captura guardada en Hoy');
  };

  const handleDeleteSnapshot = (snapshotId) => {
    const updated = { ...snapshotsByDate };
    const dateSnapshots = (updated[selectedDate] || []).filter(
      (snapshot) => snapshot.id !== snapshotId
    );

    if (dateSnapshots.length > 0) {
      updated[selectedDate] = dateSnapshots;
    } else {
      delete updated[selectedDate];
    }

    setSnapshotsByDate(updated);
    saveSnapshotsToStorage(updated);
    setPreviewSnapshotId(null);

    if (!updated[selectedDate]) {
      const remainingDates = Object.keys(updated).sort((a, b) => b.localeCompare(a));
      setSelectedDate(remainingDates[0] || getTodayString());
    }
  };

  const startPreview = (snapshotId) => {
    setPreviewSnapshotId(snapshotId);
  };

  const stopPreview = () => {
    setPreviewSnapshotId(null);
  };

  const changeSelectedDate = (offset) => {
    const current = new Date(`${selectedDate}T00:00:00`);
    current.setDate(current.getDate() + offset);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleTodayView = () => {
    setSelectedDate(getTodayString());
  };

  const savedDates = Object.keys(snapshotsByDate).sort((a, b) => b.localeCompare(a));
  const snapshots = snapshotsByDate[selectedDate] || [];
  const today = getTodayString();

  return (
    <div className="canvas-draw">
      <div className="canvas-draw-header canvas-draw-header-top">
        <div>
          <h2>Pizarra</h2>
          <p className="canvas-subtitle">Dibuja y guarda capturas por día.</p>
        </div>
        <div className="canvas-actions">
          <button className="btn-save" onClick={handleSaveSnapshot} type="button">
            Guardar captura
          </button>
          <button className="btn-clear" onClick={handleClear} type="button">
            Limpiar
          </button>
        </div>
      </div>

      <div className="date-controls">
        <button type="button" onClick={() => changeSelectedDate(-1)}>
          ← Día anterior
        </button>
        <button type="button" onClick={handleTodayView} disabled={selectedDate === today}>
          Hoy
        </button>
        <button type="button" onClick={() => changeSelectedDate(1)} disabled={selectedDate === today}>
          Día siguiente
        </button>
      </div>

      <div className="selected-day-info">
        <strong>Sección:</strong> {formatDateLabel(selectedDate)}
        {selectedDate !== today && <span className="saved-note">(solo vista de días pasados)</span>}
      </div>

      <canvas
        ref={canvasRef}
        className="draw-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      <p className="canvas-hint">Usa tu stylus o el dedo para dibujar aquí.</p>
      {saveMessage && <div className="save-message">{saveMessage}</div>}

      <div className="saved-section">
        <div className="saved-header">
          <h3>Capturas guardadas</h3>
          {savedDates.length > 0 && (
            <div className="date-list">
              {savedDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  className={`date-pill ${date === selectedDate ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </button>
              ))}
            </div>
          )}
        </div>

        {snapshots.length === 0 ? (
          <p className="empty-message">No hay capturas para esta fecha.</p>
        ) : (
          <div className="saved-gallery">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="saved-card">
                <div className="saved-card-image-wrap">
                  <img src={snapshot.image} alt="Captura de pizarra" />
                  <div className="saved-card-actions">
                    <button
                      type="button"
                      className="icon-btn view-btn"
                      onPointerDown={() => startPreview(snapshot.id)}
                      onPointerUp={stopPreview}
                      onPointerLeave={stopPreview}
                      onPointerCancel={stopPreview}
                      aria-label="Ver captura ampliada"
                    >
                      👁
                    </button>
                    <button
                      type="button"
                      className="icon-btn delete-btn"
                      onClick={() => handleDeleteSnapshot(snapshot.id)}
                      aria-label="Eliminar captura"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="saved-card-footer">
                  <span>{new Date(snapshot.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {previewSnapshotId && (
        <div className="preview-overlay" onClick={stopPreview}>
          <div className="preview-box" onClick={(e) => e.stopPropagation()}>
            <img
              src={snapshots.find((snapshot) => snapshot.id === previewSnapshotId)?.image}
              alt="Vista ampliada de captura"
            />
          </div>
        </div>
      )}
    </div>
  );
}

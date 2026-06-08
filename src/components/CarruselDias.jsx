function CarruselDias() {
  return (
    <section className="carrusel-dias">
      <button>{"<"}</button>

      <div className="dia">
        <span>Lun</span>
        <strong>8</strong>
      </div>

      <div className="dia activo">
        <span>Mar</span>
        <strong>9</strong>
      </div>

      <div className="dia">
        <span>Mié</span>
        <strong>10</strong>
      </div>

      <button>{">"}</button>
    </section>
  );
}

export default CarruselDias;
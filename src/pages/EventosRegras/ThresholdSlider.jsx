import "./ThresholdSlider.css";

export function ThresholdSlider({ rule, onChange }) {
  const { parametro } = rule;

  return (
    <div className="threshold-slider">
      <div className="threshold-slider-top">
        <span className="threshold-slider-label">{parametro.label}</span>
        <span className="threshold-slider-value">
          {parametro.valor}
          {parametro.tipo === "probabilidade" ? "%" : parametro.tipo === "kmh" ? " km/h" : parametro.tipo === "mm" ? " mm" : ""}
        </span>
      </div>
      <input
        type="range"
        min={parametro.min}
        max={parametro.max}
        step={parametro.step}
        value={parametro.valor}
        onChange={(event) => onChange(rule.id, Number(event.target.value))}
      />
      <div className="threshold-slider-scale">
        <span>{parametro.min}</span>
        <span>{parametro.max}</span>
      </div>
    </div>
  );
}

export default function Funnel({ lignes, total }) {
  return (
    <div>
      {lignes.map((l) => (
        <div key={l.label} className="funnel-row">
          <div className="funnel-head">
            <span>{l.label}</span>
            <strong>{l.value}</strong>
          </div>
          <div className="funnel-track">
            <div
              className="funnel-bar"
              style={{ width: total ? `${(l.value / total) * 100}%` : '0%', background: l.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
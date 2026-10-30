export default function StatCard({ label, value, note, icon: Icon, tone = 'teal', noteTone = '', accent = false }) {
  return (
    <div className={`card stat${accent ? ' accent' : ''}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={17} className={`stat-icon ${tone}`} />}
      </div>
      <strong className="stat-value">{value}</strong>
      <span className={`stat-note ${noteTone}`}>{note}</span>
    </div>
  );
}
import "./StatCard.css";

export function StatCard({ icon: Icon, label, value, accent = "navy" }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon stat-card-icon-${accent}`}>
        <Icon size={20} strokeWidth={2.1} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}

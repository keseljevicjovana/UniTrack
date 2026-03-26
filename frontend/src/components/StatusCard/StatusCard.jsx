import './StatusCard.css'

function StatusCard({ title, value, unit, addition }) {
  return (
    <div className="status-card">
      <div className="status-card__body">
        <div className="status-card__left">
          <span className="status-card__title">{title}</span>
          <div className="status-card__value-row">
            <span className="status-card__value">{value}</span>
            {unit && <span className="status-card__unit">{unit}</span>}
          </div>
        </div>

        {addition?.type === 'icon' && (
          <div className="status-card__icon" aria-hidden="true">
            {addition.icon}
          </div>
        )}
      </div>

      {addition?.type === 'text' && (
        <p className="status-card__addition-text">{addition.text}</p>
      )}

      {addition?.type === 'bar' && (
        <div className="status-card__bar" role="progressbar"
          aria-valuenow={addition.value}
          aria-valuemin={0}
          aria-valuemax={addition.max}
        >
          <div
            className="status-card__bar-fill"
            style={{ width: `${(addition.value / addition.max) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default StatusCard

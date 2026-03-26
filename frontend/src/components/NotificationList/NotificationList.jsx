import './NotificationList.css'

function NotificationList({ items }) {
  return (
    <div className="notification-list">
      {items.map((item, index) => (
        <div key={item.id}>
          <div className="notification-list__row">
            <div className="notification-list__icon" aria-hidden="true">
              {item.icon}
            </div>
            <span className="notification-list__text">{item.text}</span>
          </div>
          {index < items.length - 1 && (
            <div className="notification-list__divider" />
          )}
        </div>
      ))}
    </div>
  )
}

export default NotificationList

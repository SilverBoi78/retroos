import { useNotification } from '../../context/NotificationContext'
import './NotificationArea.css'

export default function NotificationArea() {
  const { notifications, dismiss } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="notification-area">
      {notifications.map((n) => (
        <div key={n.id} className={`notification notification--${n.type}`}>
          <span className="notification__message">{n.message}</span>
          <button
            className="notification__close"
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

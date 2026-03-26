import { Bell, Menu } from '../../assets/icons'
import { useState } from 'react'
import './Header.css'

function Header({ onMenuToggle }) {
  const [hasNotifications] = useState(true)

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Otvori meni"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="header__right">
        <span className="header__uni">Univerzitet Crne Gore</span>
        <div className="header__divider" />
        <button className="header__notification-btn" aria-label="Obavještenja">
          <Bell size={20} />
          {hasNotifications && <span className="header__notification-dot" />}
        </button>

        <button className="header__avatar" aria-label="Korisnički profil">
          <span className="header__avatar-initials">MS</span>
        </button>
      </div>
    </header>
  )
}

export default Header

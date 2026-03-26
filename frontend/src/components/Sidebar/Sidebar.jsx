import { NavLink } from 'react-router-dom'
import {
  Home,
  TrendingUp,
  Trophy,
  Ticket,
  FileUser,
  Settings,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
} from '../../assets/icons'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/pocetna', label: 'Početna', icon: Home },
  { to: '/moj-ucinak', label: 'Moj učinak', icon: TrendingUp },
  { to: '/rang-lista', label: 'Rang lista', icon: Trophy },
  { to: '/vauceri', label: 'Vaučeri', icon: Ticket },
  { to: '/digitalni-cv', label: 'Digitalni CV', icon: FileUser },
  { to: '/podesavanja', label: 'Podešavanja', icon: Settings },
]

function Sidebar({ isOpen, isCollapsed, onClose, onCollapseToggle }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}>

        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <GraduationCap size={22} color="#fff" />
          </div>
          {!isCollapsed && (
            <span className="sidebar__logo-text">UniTrack</span>
          )}
          <button className="sidebar__close-btn" onClick={onClose} aria-label="Zatvori meni">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to} className="sidebar__nav-item">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                  }
                  onClick={onClose}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon size={18} className="sidebar__nav-icon" />
                  {!isCollapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__collapse-btn"
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Proširi meni' : 'Skupi meni'}
          >
            {isCollapsed
              ? <ChevronRight size={18} />
              : <ChevronLeft size={18} />
            }
            {!isCollapsed && <span>Skupi meni</span>}
          </button>
        </div>

      </aside>
    </>
  )
}

export default Sidebar

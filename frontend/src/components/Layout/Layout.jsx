import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import './Layout.css'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const handleCollapseToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="layout">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={handleSidebarClose}
        onCollapseToggle={handleCollapseToggle}
      />
      <div className={`layout__main ${sidebarCollapsed ? 'layout__main--collapsed' : ''}`}>
        <Header onMenuToggle={handleMenuToggle} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

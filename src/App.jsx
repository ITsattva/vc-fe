import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TasksPage from './pages/TasksPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'

// Remember the visitor's preference across sessions; fall back to their OS
// setting the first time they show up.
function getInitialTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const dark = theme === 'dark'

  return (
    <div className="app">
      <header className="topnav">
        <h1 className="brand">
          <span className="brand-cat">{dark ? '🌙' : '🐱'}</span>
          Purrfect Tasks
        </h1>
        <nav>
          <NavLink to="/tasks"><span className="nav-emoji">📋</span>Tasks</NavLink>
          <NavLink to="/projects"><span className="nav-emoji">📁</span>Projects</NavLink>
          <NavLink to="/users"><span className="nav-emoji">😺</span>Users</NavLink>
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          title={dark ? 'Switch to daylight' : 'Switch to midnight cat'}
          aria-label="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
          <span className="theme-toggle-label">{dark ? 'Daylight' : 'Midnight'}</span>
        </button>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="dancing-kitties" aria-hidden="true">
          {['🐱', '😸', '😻', '🙀', '😼', '😺', '🐈'].map((cat, i) => (
            <span key={i} className="kitty" style={{ animationDelay: `${i * 0.15}s` }}>
              {cat}
            </span>
          ))}
        </div>
        <div className="footer-credit">
          <span>Made with</span> 🐾 <span>for cat people</span>
        </div>
      </footer>
    </div>
  )
}

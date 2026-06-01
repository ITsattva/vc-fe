import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TasksPage from './pages/TasksPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="topnav">
        <h1 className="brand">
          <span className="brand-cat">🐱</span>
          Purrfect Tasks
        </h1>
        <nav>
          <NavLink to="/tasks"><span className="nav-emoji">📋</span>Tasks</NavLink>
          <NavLink to="/projects"><span className="nav-emoji">📁</span>Projects</NavLink>
          <NavLink to="/users"><span className="nav-emoji">😺</span>Users</NavLink>
        </nav>
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
        <span>Made with</span> 🐾 <span>for cat people</span>
      </footer>
    </div>
  )
}

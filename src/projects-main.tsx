import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ProjectsPage from './pages/ProjectsPage'

const rootElement = document.getElementById('projects-root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ProjectsPage />
    </StrictMode>,
  )
}

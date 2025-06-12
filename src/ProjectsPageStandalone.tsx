"use client";

import { useState } from "react";
import { Plus, Trash2, Archive, Info, Edit, Download, Eye, Layers } from "lucide-react";
import ScatInterface from "./components/frame3/ScatInterface";
import "./index.css";

// Estilos inline para evitar dependencias de CSS modules
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#1f2937',
    color: 'white',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#374151',
    borderBottom: '1px solid #4b5563'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#f59e0b',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionButton: {
    backgroundColor: '#4b5563',
    border: 'none',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createButtonContainer: {
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'center'
  },
  createButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  projectsContainer: {
    flex: 1,
    padding: '0 2rem',
    overflowY: 'auto' as const
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    paddingBottom: '2rem'
  },
  projectCard: {
    backgroundColor: '#374151',
    borderRadius: '0.5rem',
    padding: '1rem',
    border: '2px solid transparent',
    cursor: 'pointer',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between'
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  projectName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: 0,
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    lineHeight: 1.2
  },
  projectActions: {
    display: 'flex',
    gap: '0.25rem',
    justifyContent: 'flex-end'
  },
  projectActionButton: {
    backgroundColor: '#6b7280',
    border: 'none',
    color: 'white',
    padding: '0.375rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomControls: {
    padding: '1rem 2rem',
    backgroundColor: '#374151',
    borderTop: '1px solid #4b5563',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectionControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  selectAllButton: {
    background: 'none',
    border: 'none',
    color: '#f59e0b',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textDecoration: 'underline'
  }
};

function ProjectsPageStandalone() {
  const [currentView, setCurrentView] = useState("projects");
  const [formData, setFormData] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(new Set());

  const initialProjects = [
    { id: 1, name: "PROYECTO 1", description: "Primer proyecto de ejemplo" },
    { id: 2, name: "PROYECTO 2", description: "Análisis sistemático de fallas" },
    { id: 3, name: "PROYECTO 3", description: "Proyecto de mejora continua" },
    { id: 4, name: "PROYECTO 4", description: "Evaluación de riesgos operativos" },
    { id: 5, name: "PROYECTO 5", description: "Optimización de procesos" },
    { id: 6, name: "PROYECTO 6", description: "Sistema de control de calidad" },
    { id: 7, name: "PROYECTO 7", description: "Plan de mantenimiento preventivo" },
    { id: 8, name: "PROYECTO 8", description: "Protocolos de seguridad industrial" },
    { id: 9, name: "PROYECTO 9", description: "Sistema de gestión ambiental" },
    { id: 10, name: "PROYECTO 10", description: "Control de inventarios" },
    { id: 11, name: "PROYECTO 11", description: "Análisis de productividad" },
    { id: 12, name: "PROYECTO 12", description: "Gestión de recursos humanos" },
  ];

  const [projects] = useState(initialProjects);

  const handleNavigateToScat = (data) => {
    setFormData(data);
    setCurrentView("scat");
  };

  const handleNavigateToProjects = () => {
    setCurrentView("projects");
  };

  const handleSelectProject = (projectId) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleViewProject = (project) => {
    handleNavigateToScat(project);
  };

  const handleEditProject = (project) => {
    alert(`Editando proyecto: ${project.name}`);
  };

  const handleDownloadProject = (project) => {
    alert(`Descargando proyecto: ${project.name}`);
  };

  if (currentView === "scat") {
    return (
      <ScatInterface 
        onNavigateToBase={handleNavigateToProjects}
        onNavigateToProjects={handleNavigateToProjects}
        onNavigateToDescription={handleNavigateToProjects}
        formData={formData}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.titleSection}>
            <Layers color="#f59e0b" size={24} />
            <h1 style={styles.title}>PROYECTOS</h1>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button 
            style={styles.actionButton}
            disabled={selectedProjects.size === 0}
            title="Eliminar seleccionados"
          >
            <Trash2 size={16} />
          </button>
          <button 
            style={styles.actionButton}
            disabled={selectedProjects.size === 0}
            title="Archivar seleccionados"
          >
            <Archive size={16} />
          </button>
          <button 
            style={styles.actionButton}
            title="Información"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Create New Project Button */}
      <div style={styles.createButtonContainer}>
        <button style={styles.createButton}>
          <Plus size={20} />
          <span>CREAR NUEVO PROYECTO</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div style={styles.projectsContainer}>
        <div style={styles.projectsGrid}>
          {projects.map((project) => (
            <div 
              key={project.id} 
              style={{
                ...styles.projectCard,
                borderColor: selectedProjects.has(project.id) ? '#f59e0b' : 'transparent',
                backgroundColor: selectedProjects.has(project.id) ? '#4b5563' : '#374151'
              }}
            >
              <div style={styles.projectHeader}>
                <input
                  type="checkbox"
                  checked={selectedProjects.has(project.id)}
                  onChange={() => handleSelectProject(project.id)}
                  style={{ marginTop: '0.125rem', accentColor: '#f59e0b' }}
                />
                <h3 style={styles.projectName}>{project.name}</h3>
              </div>
              <div style={styles.projectActions}>
                <button 
                  style={styles.projectActionButton}
                  onClick={() => handleViewProject(project)}
                  title="Ver proyecto"
                >
                  <Eye size={14} />
                </button>
                <button 
                  style={styles.projectActionButton}
                  onClick={() => handleEditProject(project)}
                  title="Editar proyecto"
                >
                  <Edit size={14} />
                </button>
                <button 
                  style={styles.projectActionButton}
                  onClick={() => handleDownloadProject(project)}
                  title="Descargar proyecto"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={styles.bottomControls}>
        <div style={styles.selectionControls}>
          <button style={styles.selectAllButton}>
            Seleccionar todo
          </button>
          {selectedProjects.size > 0 && (
            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {selectedProjects.size} seleccionado(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsPageStandalone;

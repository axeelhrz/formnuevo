"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, Trash2, RefreshCw } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProjectCard from "./ProjectCard";
import AccidentFormModal from "./accident-form-modal";
import TrashModal from "./TrashModal";
import styles from "./Baseframe.module.css";
import { useScatData } from "../contexts/ScatContext";

function BaseFrame({ onNavigateToScat, onNavigateToProjects }) {
	const { resetAllData } = useScatData();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
	const [projects, setProjects] = useState([]);
	const [deletedProjects, setDeletedProjects] = useState([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Pagination state
	const [displayedProjects, setDisplayedProjects] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const projectsPerPage = 6;

	// Función mejorada para limpiar proyectos simulados
	const cleanSimulatedProjects = (projectsList) => {
		if (!Array.isArray(projectsList)) return [];
		
		// Filtrar proyectos que NO sean de ejemplo o simulados
		return projectsList.filter(project => {
			// Verificar múltiples criterios para identificar proyectos simulados
			const isExample = project.isExample === true;
			const isSimulated = project.isSimulated === true;
			const hasGenericName = project.name && (
				project.name.startsWith('PROYECTO ') ||
				project.name.includes('ejemplo') ||
				project.name.includes('Ejemplo') ||
				project.name.includes('EJEMPLO') ||
				project.name.includes('test') ||
				project.name.includes('Test') ||
				project.name.includes('TEST')
			);
			const hasGenericDescription = project.description && (
				project.description.includes('ejemplo') ||
				project.description.includes('Ejemplo') ||
				project.description.includes('test') ||
				project.description.includes('simulado')
			);
			
			// Si tiene cualquiera de estas características, es un proyecto simulado
			return !(isExample || isSimulated || hasGenericName || hasGenericDescription);
		});
	};

	// Cargar proyectos desde localStorage al inicializar
	useEffect(() => {
		// Función para limpiar completamente todos los datos simulados
		const cleanAllSimulatedDataLocal = () => {
			console.log('=== LIMPIANDO TODOS LOS DATOS SIMULADOS ===');
			
			try {
				// Limpiar proyectos activos
				const savedProjects = localStorage.getItem('scatProjects');
				if (savedProjects) {
					const parsedProjects = JSON.parse(savedProjects);
					const cleanedProjects = cleanSimulatedProjects(parsedProjects);
					localStorage.setItem('scatProjects', JSON.stringify(cleanedProjects));
					setProjects(cleanedProjects);
				}
				
				// Limpiar proyectos eliminados
				const savedDeletedProjects = localStorage.getItem('scatDeletedProjects');
				if (savedDeletedProjects) {
					const parsedDeletedProjects = JSON.parse(savedDeletedProjects);
					const cleanedDeletedProjects = cleanSimulatedProjects(parsedDeletedProjects);
					localStorage.setItem('scatDeletedProjects', JSON.stringify(cleanedDeletedProjects));
					setDeletedProjects(cleanedDeletedProjects);
				}
				
				// Limpiar datos temporales que puedan contener información simulada
				localStorage.removeItem('scatData');
				
				console.log('Limpieza de datos simulados completada');
				
			} catch (error) {
				console.error('Error durante la limpieza de datos simulados:', error);
			}
		};

		const loadProjects = () => {
			try {
				// Primero, limpiar automáticamente cualquier dato simulado
				cleanAllSimulatedDataLocal();
				
				const savedProjects = localStorage.getItem('scatProjects');
				const savedDeletedProjects = localStorage.getItem('scatDeletedProjects');
				
				// Cargar solo proyectos reales del usuario
				let loadedProjects = [];
				if (savedProjects) {
					const parsedProjects = JSON.parse(savedProjects);
					loadedProjects = cleanSimulatedProjects(parsedProjects);
				}
				
				setProjects(loadedProjects);
				
				let loadedDeletedProjects = [];
				if (savedDeletedProjects) {
					const parsedDeletedProjects = JSON.parse(savedDeletedProjects);
					loadedDeletedProjects = cleanSimulatedProjects(parsedDeletedProjects);
				}
				
				setDeletedProjects(loadedDeletedProjects);
				
			} catch (error) {
				console.error('Error loading saved projects:', error);
				// En caso de error, empezar con arrays vacíos
				setProjects([]);
				setDeletedProjects([]);
			}
			
			setIsInitialized(true);
		};

		loadProjects();
	}, []);

	// Guardar proyectos en localStorage cuando cambien (solo después de la inicialización)
	useEffect(() => {
		if (isInitialized) {
			// Asegurar que solo guardamos proyectos reales
			const cleanedProjects = cleanSimulatedProjects(projects);
			localStorage.setItem('scatProjects', JSON.stringify(cleanedProjects));
		}
	}, [projects, isInitialized]);

	// Guardar proyectos eliminados en localStorage cuando cambien
	useEffect(() => {
		if (isInitialized) {
			// Asegurar que solo guardamos proyectos reales en la papelera
			const cleanedDeletedProjects = cleanSimulatedProjects(deletedProjects);
			localStorage.setItem('scatDeletedProjects', JSON.stringify(cleanedDeletedProjects));
		}
	}, [deletedProjects, isInitialized]);

	// Función para abrir el modal de nuevo proyecto
	const handleOpenNewProjectModal = () => {
		console.log('=== ABRIENDO MODAL PARA NUEVO PROYECTO ===');
		// Limpiar todos los datos del contexto SCAT antes de abrir el modal
		resetAllData();
		setIsModalOpen(true);
	};

	// Función para manejar la continuación al SCAT
	const handleContinue = (formData) => {
		setIsModalOpen(false);
		
		// Verificar que la función existe antes de llamarla
		if (typeof onNavigateToScat === 'function') {
			onNavigateToScat(formData);
		} else {
			console.error("onNavigateToScat is not a function:", onNavigateToScat);
			alert("Error: No se puede navegar al SCAT. Función no encontrada.");
		}
	};

	// Load more projects function
	const loadMoreProjects = useCallback((reset = false) => {
		const page = reset ? 1 : currentPage + 1;
		const startIndex = 0;
		const endIndex = page * projectsPerPage;

		const newDisplayedProjects = projects.slice(startIndex, endIndex);
		setDisplayedProjects(newDisplayedProjects);
		setCurrentPage(page);
		setHasMore(endIndex < projects.length);
	}, [projects, currentPage, projectsPerPage]);

	// Initialize displayed projects
	useEffect(() => {
		if (isInitialized) {
			loadMoreProjects(true);
		}
	}, [projects, loadMoreProjects, isInitialized]);

	const handleCreateProject = (newProject) => {
		// Asegurar que el nuevo proyecto no tenga marcas de simulado
		const realProject = {
			...newProject,
			isExample: false,
			isSimulated: false,
			isReal: true
		};
		
		setProjects((prev) => {
			const updatedProjects = [realProject, ...prev];
			return updatedProjects;
		});
	};

	const handleEditProject = (project) => {
		// Cargar todos los datos del proyecto en el contexto y navegar al SCAT en modo edición
		if (project.formData && typeof onNavigateToScat === 'function') {
			// Marcar que estamos en modo edición
			const editData = {
				...project.formData,
				isEditing: true,
				projectId: project.id,
				projectData: project
			};
			
			onNavigateToScat(editData);
		} else {
			alert('No se encontraron datos del proyecto para editar.');
		}
	};


	const handleDeleteProject = (projectId) => {
		const projectToDelete = projects.find(p => p.id === projectId);
		if (projectToDelete) {
			// Agregar fecha de eliminación
			const deletedProject = {
				...projectToDelete,
				deletedAt: new Date().toISOString()
			};
			
			// Mover a papelera
			setDeletedProjects(prev => [deletedProject, ...prev]);
			
			// Remover de proyectos activos
			setProjects(prev => prev.filter(p => p.id !== projectId));
		}
	};

	const handleRestoreProject = (project) => {
		// Remover fecha de eliminación
		const { deletedAt: _deletedAt, ...restoredProject } = project;
		
		// Restaurar a proyectos activos
		setProjects(prev => [restoredProject, ...prev]);
		
		// Remover de papelera
		setDeletedProjects(prev => prev.filter(p => p.id !== project.id));
	};

	const handlePermanentDelete = (projectId) => {
		const confirmed = window.confirm('¿Estás seguro de que quieres eliminar permanentemente este proyecto? Esta acción no se puede deshacer.');
		if (confirmed) {
			setDeletedProjects(prev => prev.filter(p => p.id !== projectId));
		}
	};

	const handleEmptyTrash = () => {
		const confirmed = window.confirm('¿Estás seguro de que quieres vaciar la papelera? Esta acción no se puede deshacer.');
		if (confirmed) {
			setDeletedProjects([]);
		}
	};

	// Función para resetear completamente la aplicación (opcional)
	const handleResetApplication = () => {
		const confirmed = window.confirm('¿Estás seguro de que quieres resetear completamente la aplicación? Esto eliminará TODOS los proyectos y datos. Esta acción no se puede deshacer.');
		if (confirmed) {
			const doubleConfirm = window.confirm('ÚLTIMA CONFIRMACIÓN: ¿Realmente quieres eliminar TODOS los datos de la aplicación?');
			if (doubleConfirm) {
				// Limpiar todo el localStorage
				localStorage.removeItem('scatProjects');
				localStorage.removeItem('scatDeletedProjects');
				localStorage.removeItem('scatData');
				
				// Resetear estados
				setProjects([]);
				setDeletedProjects([]);
				setDisplayedProjects([]);
				
				// Resetear contexto
				resetAllData();
				
				alert('Aplicación reseteada completamente. Todos los datos han sido eliminados.');
			}
		}
	};

	const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

	// Mostrar loading mientras se inicializa
	if (!isInitialized) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>
					<p>Cargando proyectos...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Sidebar 
				isOpen={isSidebarOpen} 
				onToggle={toggleSidebar}
				onNavigateToProjects={onNavigateToProjects}
			/>

			<div className={styles.mainContent}>
				<Header onMenuToggle={toggleSidebar} />

				<main className={styles.main}>
					<div className={styles.content}>
						{/* Action Buttons Container */}
						<div className={styles.actionButtonsContainer}>
							{/* Create New Project Button */}
							<button
								onClick={handleOpenNewProjectModal}
								className={styles.createButton}
							>
								<Plus size={20} />
								<span>Create New Project</span>
							</button>

							{/* Trash Button - Solo mostrar si hay proyectos eliminados */}
							{deletedProjects.length > 0 && (
								<button
									onClick={() => setIsTrashModalOpen(true)}
									className={styles.trashButton}
									title={`Papelera (${deletedProjects.length})`}
								>
									<Trash2 size={20} />
									<span>Papelera</span>
									<span className={styles.trashCount}>{deletedProjects.length}</span>
								</button>
							)}

							{/* Reset Button - Solo en desarrollo o cuando sea necesario */}
							<button
								onClick={handleResetApplication}
								className={styles.resetButton}
								title="Resetear aplicación completamente"
							>
								<RefreshCw size={20} />
								<span>Reset App</span>
							</button>
						</div>

						{/* Projects Grid */}
						{projects.length > 0 ? (
							<>
								<div className={styles.projectsGrid}>
									{displayedProjects.map((project, index) => (
										<ProjectCard
											key={project.id}
											project={project}
											isHighlighted={index === 0}
											onDelete={() => handleDeleteProject(project.id)}
											onEdit={() => handleEditProject(project)}
										/>
									))}
								</div>

								{/* Load More Button */}
								{hasMore && (
									<div className={styles.loadMoreContainer}>
										<button
											onClick={() => loadMoreProjects()}
											className={styles.loadMoreButton}
										>
											<span>Cargar más proyectos</span>
											<ChevronDown size={18} />
										</button>
									</div>
								)}
							</>
						) : (
							/* Empty state - Mostrar cuando no hay proyectos */
							<div className={styles.emptyState}>
								<div className={styles.emptyIcon}>
									<Plus size={64} />
								</div>
								<p className={styles.emptyTitle}>No tienes proyectos creados</p>
								<p className={styles.emptyDescription}>
									Comienza creando tu primer proyecto de análisis SCAT
								</p>
								<button
									onClick={handleOpenNewProjectModal}
									className={styles.emptyStateButton}
								>
									<Plus size={20} />
									<span>Crear mi primer proyecto</span>
								</button>
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Accident Form Modal */}
			<AccidentFormModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onCreateProject={handleCreateProject}
				onContinue={handleContinue}
			/>

			{/* Trash Modal */}
			<TrashModal
				isOpen={isTrashModalOpen}
				onClose={() => setIsTrashModalOpen(false)}
				deletedProjects={deletedProjects}
				onRestoreProject={handleRestoreProject}
				onPermanentDelete={handlePermanentDelete}
				onEmptyTrash={handleEmptyTrash}
			/>
		</div>
	);
}

export default BaseFrame;
"use client";

import { useState, useEffect } from "react";
import { Trash2, Archive, Info, Edit, Download, Eye, Layers } from "lucide-react";
import TrashModal from "./TrashModal";
import EditProjectModal from "./EditProjectModal";
import styles from "./ProjectsView.module.css";
import pdfService from "../services/pdfService";
import { generatePDFDataFromProject } from "../utils/pdfDataNormalizer";

function ProjectsView({ onNavigateToBase, onNavigateToScat }) {
	const [projects, setProjects] = useState([]);
	const [deletedProjects, setDeletedProjects] = useState([]);
	const [selectedProjects, setSelectedProjects] = useState(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const projectsPerPage = 16;

	// Función para limpiar proyectos simulados
	const cleanSimulatedProjects = (projectsList) => {
		if (!Array.isArray(projectsList)) return [];
		
		return projectsList.filter(project => {
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
			
			return !(isExample || isSimulated || hasGenericName || hasGenericDescription);
		});
	};

	// Cargar proyectos reales desde localStorage
	useEffect(() => {
		const loadRealProjects = () => {
			try {
				setIsLoading(true);
				
				// Cargar proyectos activos
				const savedProjects = localStorage.getItem('scatProjects');
				let loadedProjects = [];
				if (savedProjects) {
					const parsedProjects = JSON.parse(savedProjects);
					loadedProjects = cleanSimulatedProjects(parsedProjects);
				}
				setProjects(loadedProjects);
				
				// Cargar proyectos eliminados
				const savedDeletedProjects = localStorage.getItem('scatDeletedProjects');
				let loadedDeletedProjects = [];
				if (savedDeletedProjects) {
					const parsedDeletedProjects = JSON.parse(savedDeletedProjects);
					loadedDeletedProjects = cleanSimulatedProjects(parsedDeletedProjects);
				}
				setDeletedProjects(loadedDeletedProjects);
				
			} catch (error) {
				console.error('Error loading projects:', error);
				setProjects([]);
				setDeletedProjects([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadRealProjects();
	}, []);

	// Sincronizar cambios con localStorage
	useEffect(() => {
		if (!isLoading) {
			const cleanedProjects = cleanSimulatedProjects(projects);
			localStorage.setItem('scatProjects', JSON.stringify(cleanedProjects));
		}
	}, [projects, isLoading]);

	useEffect(() => {
		if (!isLoading) {
			const cleanedDeletedProjects = cleanSimulatedProjects(deletedProjects);
			localStorage.setItem('scatDeletedProjects', JSON.stringify(cleanedDeletedProjects));
		}
	}, [deletedProjects, isLoading]);

	// Calcular proyectos para la página actual
	const indexOfLastProject = currentPage * projectsPerPage;
	const indexOfFirstProject = indexOfLastProject - projectsPerPage;
	const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
	const totalPages = Math.ceil(projects.length / projectsPerPage);

	const handleSelectProject = (projectId) => {
		const newSelected = new Set(selectedProjects);
		if (newSelected.has(projectId)) {
			newSelected.delete(projectId);
		} else {
			newSelected.add(projectId);
		}
		setSelectedProjects(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedProjects.size === currentProjects.length) {
			setSelectedProjects(new Set());
		} else {
			setSelectedProjects(new Set(currentProjects.map(p => p.id)));
		}
	};

	const handleDeleteSelected = () => {
		if (selectedProjects.size > 0) {
			const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar ${selectedProjects.size} proyecto(s)?`);
			if (confirmed) {
				// Mover proyectos seleccionados a papelera
				const projectsToDelete = projects.filter(p => selectedProjects.has(p.id));
				const deletedProjectsWithDate = projectsToDelete.map(project => ({
					...project,
					deletedAt: new Date().toISOString()
				}));
				
				setDeletedProjects(prev => [...deletedProjectsWithDate, ...prev]);
				setProjects(projects.filter(p => !selectedProjects.has(p.id)));
				setSelectedProjects(new Set());
			}
		}
	};

	const handleArchiveSelected = () => {
		if (selectedProjects.size > 0) {
			alert(`${selectedProjects.size} proyecto(s) archivado(s)`);
			setSelectedProjects(new Set());
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

	const handleViewProject = (project) => {
		// Navegar al SCAT con los datos del proyecto en modo solo lectura
		if (onNavigateToScat && project.formData) {
			console.log('=== VISUALIZANDO PROYECTO ===');
			console.log('Proyecto:', project);
			
			const viewData = {
				...project.formData,
				isViewing: true, // Modo solo lectura
				projectId: project.id,
				projectData: project
			};
			onNavigateToScat(viewData);
		} else {
			alert('No se encontraron datos del proyecto para visualizar.');
		}
	};

	const handleEditProject = (project) => {
		// Navegar al SCAT con los datos del proyecto en modo edición
		console.log('=== EDITANDO PROYECTO COMPLETO ===');
		console.log('Proyecto a editar:', project);
		
		if (onNavigateToScat && project.formData) {
			const editData = {
				...project.formData,
				isEditing: true, // Modo edición
				projectId: project.id,
				projectData: project
			};
			
			console.log('Navegando al SCAT en modo edición con datos:', editData);
			onNavigateToScat(editData);
		} else {
			alert('No se encontraron datos del proyecto para editar.');
		}
	};

	const handleEditProjectInfo = (project) => {
		// Abrir modal de edición solo para información básica
		console.log('=== EDITANDO INFORMACIÓN DEL PROYECTO ===');
		console.log('Proyecto a editar:', project);
		
		setEditingProject(project);
		setIsEditModalOpen(true);
	};

	const handleSaveProject = (updatedProject) => {
		console.log('=== GUARDANDO PROYECTO ACTUALIZADO ===');
		console.log('Proyecto actualizado:', updatedProject);
		
		// Actualizar proyecto en la lista
		setProjects(prev => prev.map(p => 
			p.id === updatedProject.id ? updatedProject : p
		));
		
		// Cerrar modal
		setIsEditModalOpen(false);
		setEditingProject(null);
		
		alert('Proyecto actualizado exitosamente');
	};

	const handleDownloadProject = async (project) => {
		try {
			console.log('=== DESCARGANDO PROYECTO DESDE DASHBOARD ===');
			console.log('Proyecto completo:', project);
			
			// Verificar que el proyecto tenga datos
			if (!project) {
				alert('No hay datos del proyecto para generar el PDF');
				return;
			}

			// Usar la función normalizada para generar datos PDF consistentes
			// Esto asegura que se use el mismo formato que en otros lugares
			const normalizedData = generatePDFDataFromProject(project);
			
			console.log('Datos normalizados para PDF desde dashboard:', normalizedData);

			// Generar nombre del archivo
			const fileName = `SCAT_${(project.name || project.formData?.evento || 'Proyecto').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
			
			// Generar y descargar PDF usando los datos normalizados
			await pdfService.downloadPDF(normalizedData, fileName);
			
			console.log('PDF descargado exitosamente desde dashboard');
		} catch (error) {
			console.error('Error descargando proyecto desde dashboard:', error);
			alert('Error al generar el PDF. Por favor, intente nuevamente.');
		}
	};

	const handleBackToMenu = () => {
		if (onNavigateToBase) {
			onNavigateToBase();
		}
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
		setSelectedProjects(new Set());
	};

	// Mostrar loading mientras se cargan los proyectos
	if (isLoading) {
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
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.headerLeft}>
					<button 
						className={styles.backButton}
						onClick={handleBackToMenu}
						title="Volver al menú principal"
					>
						← Menú Principal
					</button>
					<div className={styles.titleSection}>
						<Layers className={styles.titleIcon} size={24} />
						<h1 className={styles.title}>PROYECTOS</h1>
					</div>
				</div>
				<div className={styles.headerRight}>
					<button 
						className={styles.actionButton}
						onClick={handleDeleteSelected}
						disabled={selectedProjects.size === 0}
						title="Eliminar seleccionados"
					>
						<Trash2 size={16} />
					</button>
					<button 
						className={styles.actionButton}
						onClick={handleArchiveSelected}
						disabled={selectedProjects.size === 0}
						title="Archivar seleccionados"
					>
						<Archive size={16} />
					</button>
					<button 
						className={`${styles.actionButton} ${styles.trashButton}`}
						onClick={() => setIsTrashModalOpen(true)}
						title={`Papelera (${deletedProjects.length})`}
					>
						<Trash2 size={16} />
						{deletedProjects.length > 0 && (
							<span className={styles.trashCount}>{deletedProjects.length}</span>
						)}
					</button>
					<button 
						className={styles.actionButton}
						title="Información"
					>
						<Info size={16} />
					</button>
				</div>
			</div>

			{/* Projects Grid */}
			<div className={styles.projectsContainer}>
				{projects.length > 0 ? (
					<div className={styles.projectsGrid}>
						{currentProjects.map((project) => (
							<div 
								key={project.id} 
								className={`${styles.projectCard} ${selectedProjects.has(project.id) ? styles.selected : ''}`}
							>
								<div className={styles.projectHeader}>
									<input
										type="checkbox"
										checked={selectedProjects.has(project.id)}
										onChange={() => handleSelectProject(project.id)}
										className={styles.checkbox}
									/>
									<h3 className={styles.projectName}>
										{project.name || project.formData?.evento || 'Proyecto sin nombre'}
									</h3>
								</div>
								<div className={styles.projectInfo}>
									<p className={styles.projectDescription}>
										{project.description || project.formData?.otrosDatos || 'Sin descripción'}
									</p>
									<p className={styles.projectDate}>
										Creado: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Fecha desconocida'}
									</p>
									{project.lastModified && (
										<p className={styles.projectModified}>
											Modificado: {new Date(project.lastModified).toLocaleDateString()}
										</p>
									)}
									{project.version && project.version > 1 && (
										<p className={styles.projectVersion}>
											Versión: {project.version}
										</p>
									)}
									{project.scatData && (
										<p className={styles.projectScatData}>
											✓ Datos SCAT disponibles
										</p>
									)}
								</div>
								<div className={styles.projectActions}>
									<button 
										className={styles.projectActionButton}
										onClick={() => handleViewProject(project)}
										title="Ver proyecto (solo lectura)"
									>
										<Eye size={14} />
									</button>
									<button 
										className={`${styles.projectActionButton} ${styles.editButton}`}
										onClick={() => handleEditProject(project)}
										title="Editar proyecto completo (SCAT)"
									>
										<Edit size={14} />
									</button>
									<button 
										className={styles.projectActionButton}
										onClick={() => handleEditProjectInfo(project)}
										title="Editar solo información básica"
									>
										<Info size={14} />
									</button>
									<button 
										className={styles.projectActionButton}
										onClick={() => handleDownloadProject(project)}
										title="Descargar PDF del proyecto"
									>
										<Download size={14} />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					/* Empty state cuando no hay proyectos */
					<div className={styles.emptyState}>
						<div className={styles.emptyIcon}>
							<Layers size={64} />
						</div>
						<p className={styles.emptyTitle}>No tienes proyectos creados</p>
						<p className={styles.emptyDescription}>
							Los proyectos que crees aparecerán aquí. Regresa al menú principal para crear tu primer proyecto.
						</p>
						<button
							onClick={handleBackToMenu}
							className={styles.emptyStateButton}
						>
							← Volver al menú principal
						</button>
					</div>
				)}
			</div>

			{/* Bottom Controls */}
			{projects.length > 0 && (
				<div className={styles.bottomControls}>
					<div className={styles.selectionControls}>
						<button 
							className={styles.selectAllButton}
							onClick={handleSelectAll}
						>
							{selectedProjects.size === currentProjects.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
						</button>
						{selectedProjects.size > 0 && (
							<span className={styles.selectedCount}>
								{selectedProjects.size} seleccionado(s)
							</span>
						)}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className={styles.pagination}>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<button
									key={page}
									className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
									onClick={() => handlePageChange(page)}
								>
									{page}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Trash Modal */}
			<TrashModal
				isOpen={isTrashModalOpen}
				onClose={() => setIsTrashModalOpen(false)}
				deletedProjects={deletedProjects}
				onRestoreProject={handleRestoreProject}
				onPermanentDelete={handlePermanentDelete}
				onEmptyTrash={handleEmptyTrash}
			/>

			{/* Edit Project Modal */}
			<EditProjectModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingProject(null);
				}}
				project={editingProject}
				onSave={handleSaveProject}
				onNavigateToScat={onNavigateToScat}
			/>
		</div>
	);
}

export default ProjectsView;
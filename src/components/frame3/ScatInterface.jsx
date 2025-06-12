"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./ScatInterface.module.css";
import EvaluacionContent from "./content/EvaluacionContent";
import ContactoContent from "./content/ContactoContent";
import CausasInmediatasContent from "./content/CausasInmediatasContent";
import CausasBasicasContent from "./content/CausasBasicasContent";
import NecesidadesControlContent from "./content/NecesidadesControlContent";
import { useScatData } from "../../contexts/ScatContext";
import {
	InfoIcon,
	SaveIcon,
	GridIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
} from "./icons/Icons";

const scatSections = [
	{
		id: "evaluacion",
		title: "EVALUACIÓN POTENCIAL DE PERDIDA SI NO ES CONTROLADO",
		component: EvaluacionContent,
	},
	{
		id: "contacto",
		title: "Tipo de Contacto o Cuasi Contacto con Energía o Sustancia",
		component: ContactoContent,
	},
	{
		id: "causas-inmediatas",
		title: "(CI) Causas Inmediatas o Directas",
		component: CausasInmediatasContent,
	},
	{
		id: "causas-basicas",
		title: "(CB) Causas Básicas / Subyacentes",
		component: CausasBasicasContent,
	},
	{
		id: "necesidades-control",
		title: "(NAC) Necesidades de Acción de Control (NAC) = Falta de Control",
		component: NecesidadesControlContent,
	},
];

function ScatInterface({ 
	onNavigateToBase, 
	onNavigateToProjects, 
	onNavigateToDescription, 
	formData
}) {
	const [activeSection, setActiveSection] = useState("evaluacion");
	const [isInitialized, setIsInitialized] = useState(false);
	const [isViewingMode, setIsViewingMode] = useState(false);
	const [isEditingMode, setIsEditingMode] = useState(false);
	const [editingProjectId, setEditingProjectId] = useState(null);
	const [initializationError, setInitializationError] = useState(null);
	
	const { 
		setProjectData, 
		hasData, 
		resetAllData,
		loadProjectData,
		getCompleteSummary,
		projectData,
		evaluacionData,
		contactoData,
		causasInmediatasData,
		causasBasicasData,
		necesidadesControlData,
		currentProjectId,
		forceSave,
		setEditingMode,
		setCurrentProject
	} = useScatData();

	// Función para guardar datos SCAT
	const saveScatDataToProject = useCallback(async () => {
		console.log('=== GUARDANDO DATOS SCAT EN PROYECTO ===');
		
		if (!currentProjectId) {
			console.log('No hay proyecto actual para auto-guardar');
			const currentState = getCompleteSummary();
			localStorage.setItem('scatData', JSON.stringify(currentState));
			return true;
		}

		try {
			forceSave();
			console.log('Datos SCAT guardados en proyecto existente');
			return true;
		} catch (error) {
			console.error('Error guardando en proyecto existente:', error);
			return false;
		}
	}, [currentProjectId, forceSave, getCompleteSummary]);

	// INICIALIZACIÓN COMPLETAMENTE REESCRITA
	useEffect(() => {
		console.log('=== INICIALIZANDO SCAT INTERFACE (PRESERVACIÓN TOTAL) ===');
		console.log('FormData recibido:', formData);
		console.log('isInitialized:', isInitialized);
		
		if (isInitialized) {
			console.log('Ya está inicializado, saltando...');
			return;
		}

		const initializeInterface = async () => {
			try {
				setInitializationError(null);
				console.log('=== INICIANDO PROCESO DE INICIALIZACIÓN ===');
				
				if (formData) {
					if (formData.isViewing && formData.projectData) {
						// MODO VISUALIZACIÓN
						console.log('=== MODO VISUALIZACIÓN - CARGANDO PROYECTO COMPLETO ===');
						console.log('Proyecto a visualizar:', formData.projectData);
						
						// Limpiar contexto
						resetAllData();
						await new Promise(resolve => setTimeout(resolve, 200));
						
						// Cargar proyecto completo
						const loadSuccess = loadProjectData(formData.projectData);
						if (!loadSuccess) {
							throw new Error('Error cargando datos del proyecto para visualización');
						}
						
						// Establecer modo visualización
						setIsViewingMode(true);
						setIsEditingMode(false);
						setEditingProjectId(null);
						
						console.log('=== PROYECTO CARGADO PARA VISUALIZACIÓN ===');
						
					} else if (formData.isEditing && formData.projectData) {
						// MODO EDICIÓN - CRÍTICO PARA PRESERVAR DATOS
						console.log('=== MODO EDICIÓN - CARGANDO PROYECTO COMPLETO PARA EDICIÓN ===');
						console.log('Proyecto a editar:', formData.projectData);
						console.log('FormData del proyecto:', formData.projectData.formData);
						console.log('ScatData del proyecto:', formData.projectData.scatData);
						
						// Limpiar contexto
						resetAllData();
						await new Promise(resolve => setTimeout(resolve, 200));
						
						// CARGAR PROYECTO COMPLETO CON TODOS LOS DATOS
						const loadSuccess = loadProjectData(formData.projectData);
						if (!loadSuccess) {
							throw new Error('Error cargando datos del proyecto para edición');
						}
						
						// Esperar a que se carguen los datos
						await new Promise(resolve => setTimeout(resolve, 100));
						
						// Establecer modo edición
						setEditingMode(true, formData.projectId);
						setCurrentProject(formData.projectId);
						
						// Establecer estados locales
						setIsViewingMode(false);
						setIsEditingMode(true);
						setEditingProjectId(formData.projectId);
						
						console.log('=== PROYECTO CARGADO PARA EDICIÓN - TODOS LOS DATOS PRESERVADOS ===');
						
					} else {
						// MODO NUEVO PROYECTO O CONTINUACIÓN
						console.log('=== MODO NUEVO PROYECTO/CONTINUACIÓN ===');
						console.log('FormData para nuevo proyecto:', formData);
						
						resetAllData();
						await new Promise(resolve => setTimeout(resolve, 100));
						
						// Establecer datos del proyecto
						setProjectData(formData);
						
						// Si hay projectId, establecerlo como proyecto actual
						if (formData.projectId) {
							setCurrentProject(formData.projectId);
						}
						
						setIsViewingMode(false);
						setIsEditingMode(false);
						setEditingProjectId(null);
						
						console.log('=== NUEVO PROYECTO INICIALIZADO ===');
					}
				} else {
					// SIN DATOS
					console.log('=== SIN DATOS - INICIALIZACIÓN LIMPIA ===');
					resetAllData();
					setIsViewingMode(false);
					setIsEditingMode(false);
					setEditingProjectId(null);
				}
				
				setIsInitialized(true);
				console.log('=== INICIALIZACIÓN COMPLETADA EXITOSAMENTE ===');
				
			} catch (error) {
				console.error('Error en inicialización:', error);
				setInitializationError(error.message);
				setIsInitialized(true);
			}
		};

		initializeInterface();
	}, [formData, isInitialized, resetAllData, setProjectData, loadProjectData, setEditingMode, setCurrentProject]);

	// Debug: Mostrar datos cargados DESPUÉS de la inicialización
	useEffect(() => {
		if (isInitialized) {
			console.log('=== DATOS DESPUÉS DE INICIALIZACIÓN ===');
			console.log('isViewingMode:', isViewingMode);
			console.log('isEditingMode:', isEditingMode);
			console.log('editingProjectId:', editingProjectId);
			console.log('currentProjectId:', currentProjectId);
			console.log('projectData cargado:', projectData);
			console.log('evaluacionData cargado:', evaluacionData);
			console.log('contactoData cargado:', contactoData);
			console.log('causasInmediatasData cargado:', causasInmediatasData);
			console.log('causasBasicasData cargado:', causasBasicasData);
			console.log('necesidadesControlData cargado:', necesidadesControlData);
		}
	}, [isInitialized, isViewingMode, isEditingMode, editingProjectId, currentProjectId, projectData, evaluacionData, contactoData, causasInmediatasData, causasBasicasData, necesidadesControlData]);

	// Función para guardar proyecto editado
	const saveEditedProject = useCallback(async () => {
		if (!isEditingMode || !editingProjectId) {
			console.log('No está en modo edición o no hay proyecto ID');
			return false;
		}

		try {
			console.log('=== GUARDANDO PROYECTO EDITADO ===');
			console.log('Project ID:', editingProjectId);
			
			// Obtener datos completos actuales
			const currentData = getCompleteSummary();
			console.log('Datos actuales para guardar:', currentData);

			// Obtener proyectos del localStorage
			const savedProjects = localStorage.getItem('scatProjects');
			if (!savedProjects) {
				throw new Error('No se encontraron proyectos en localStorage');
			}

			const projects = JSON.parse(savedProjects);
			const projectIndex = projects.findIndex(p => p.id === editingProjectId);
			
			if (projectIndex === -1) {
				throw new Error('Proyecto no encontrado');
			}

			// Actualizar proyecto PRESERVANDO TODO
			const updatedProject = {
				...projects[projectIndex],
				// PRESERVAR Y ACTUALIZAR formData
				formData: {
					...projects[projectIndex].formData,
					...currentData.project
				},
				// ACTUALIZAR datos SCAT
				scatData: {
					evaluacion: currentData.evaluacion,
					contacto: currentData.contacto,
					causasInmediatas: currentData.causasInmediatas,
					causasBasicas: currentData.causasBasicas,
					necesidadesControl: currentData.necesidadesControl
				},
				// Actualizar metadatos
				lastModified: new Date().toISOString(),
				version: (projects[projectIndex].version || 1) + 1
			};

			projects[projectIndex] = updatedProject;
			localStorage.setItem('scatProjects', JSON.stringify(projects));
			
			console.log('=== PROYECTO EDITADO GUARDADO EXITOSAMENTE ===');
			console.log('Proyecto actualizado:', updatedProject);
			
			return true;
		} catch (error) {
			console.error('Error guardando proyecto editado:', error);
			return false;
		}
	}, [isEditingMode, editingProjectId, getCompleteSummary]);

	// Navegación entre secciones
	const handleSectionClick = useCallback((sectionId) => {
		console.log('=== NAVEGANDO A SECCIÓN ===', sectionId);
		
		const sectionExists = scatSections.find(section => section.id === sectionId);
		if (!sectionExists) {
			console.error('Sección no encontrada:', sectionId);
			return;
		}

		setActiveSection(sectionId);
	}, []);

	// Función para obtener el índice de la sección actual
	const getCurrentSectionIndex = useCallback(() => {
		const index = scatSections.findIndex(section => section.id === activeSection);
		return index;
	}, [activeSection]);

	// Navegación a sección anterior
	const goToPreviousSection = useCallback(() => {
		const currentIndex = getCurrentSectionIndex();
		if (currentIndex > 0) {
			const previousSection = scatSections[currentIndex - 1];
			setActiveSection(previousSection.id);
		}
	}, [getCurrentSectionIndex]);

	// Navegación a sección siguiente
	const goToNextSection = useCallback(() => {
		const currentIndex = getCurrentSectionIndex();
		if (currentIndex < scatSections.length - 1) {
			const nextSection = scatSections[currentIndex + 1];
			setActiveSection(nextSection.id);
		}
	}, [getCurrentSectionIndex]);

	// Funciones para verificar si se puede navegar
	const canGoPrevious = useCallback(() => {
		return getCurrentSectionIndex() > 0;
	}, [getCurrentSectionIndex]);

	const canGoNext = useCallback(() => {
		return getCurrentSectionIndex() < scatSections.length - 1;
	}, [getCurrentSectionIndex]);

	// Navegación principal con guardado automático
	const handleBackToMenu = useCallback(async () => {
		console.log('=== NAVEGANDO AL MENÚ PRINCIPAL ===');
		
		if (isViewingMode) {
			if (onNavigateToBase) {
				onNavigateToBase();
			}
			return;
		}

		// Guardar datos antes de salir
		if (hasData()) {
			console.log('Hay datos para guardar antes de salir');
			
			try {
				let saved = false;
				
				if (isEditingMode) {
					saved = await saveEditedProject();
				} else {
					saved = await saveScatDataToProject();
				}
				
				if (saved) {
					console.log('Datos guardados exitosamente antes de navegar');
				} else {
					console.log('Error guardando datos, pero continuando navegación');
				}
			} catch (error) {
				console.error('Error en guardado antes de navegar:', error);
			}
		}
		
		if (onNavigateToBase) {
			onNavigateToBase();
		}
	}, [isViewingMode, isEditingMode, hasData, onNavigateToBase, saveEditedProject, saveScatDataToProject]);

	const handleShowGrid = useCallback(async () => {
		console.log('=== NAVEGANDO A PROYECTOS ===');
		
		if (isViewingMode) {
			if (onNavigateToProjects) {
				onNavigateToProjects();
			}
			return;
		}

		// Guardar datos antes de salir
		if (hasData()) {
			console.log('Hay datos para guardar antes de ir a proyectos');
			
			try {
				let saved = false;
				
				if (isEditingMode) {
					saved = await saveEditedProject();
				} else {
					saved = await saveScatDataToProject();
				}
				
				if (saved) {
					console.log('Datos guardados exitosamente antes de navegar a proyectos');
				} else {
					console.log('Error guardando datos, pero continuando navegación');
				}
			} catch (error) {
				console.error('Error en guardado antes de navegar a proyectos:', error);
			}
		}
		
		if (onNavigateToProjects) {
			onNavigateToProjects();
		}
	}, [isViewingMode, isEditingMode, hasData, onNavigateToProjects, saveEditedProject, saveScatDataToProject]);

	const handleCompleteAnalysis = useCallback(async () => {
		console.log('=== COMPLETANDO ANÁLISIS ===');
		
		if (!hasData()) {
			alert("Por favor, complete al menos una sección antes de finalizar el análisis.");
			return;
		}
		
		// Guardar antes de finalizar
		try {
			let saved = false;
			
			if (isEditingMode) {
				saved = await saveEditedProject();
			} else {
				saved = await saveScatDataToProject();
			}
			
			if (saved) {
				console.log('Datos guardados exitosamente antes de finalizar');
			}
		} catch (error) {
			console.error('Error guardando antes de finalizar:', error);
		}
		
		if (onNavigateToDescription) {
			onNavigateToDescription();
		}
	}, [hasData, isEditingMode, onNavigateToDescription, saveEditedProject, saveScatDataToProject]);

	// Funciones de utilidad
	const handleSaveProgress = useCallback(async () => {
		if (isViewingMode) {
			alert('Este proyecto está en modo solo lectura');
			return;
		}
		
		console.log('=== GUARDANDO PROGRESO MANUALMENTE ===');
		
		try {
			let saved = false;
			
			if (isEditingMode) {
				saved = await saveEditedProject();
			} else {
				saved = await saveScatDataToProject();
			}
			
			if (saved) {
				alert('Progreso guardado exitosamente');
			} else {
				alert('Error al guardar el progreso');
			}
		} catch (error) {
			console.error('Error guardando progreso:', error);
			alert('Error al guardar el progreso');
		}
	}, [isViewingMode, isEditingMode, saveEditedProject, saveScatDataToProject]);

	const handleShowInfo = () => {
		const currentSection = scatSections.find(section => section.id === activeSection);
		let modeInfo = '';
		if (isViewingMode) {
			modeInfo = ' (Modo solo lectura)';
		} else if (isEditingMode) {
			modeInfo = ' (Modo edición)';
		}
		alert(`Información sobre: ${currentSection?.title}${modeInfo}`);
	};

	// Obtener el componente activo
	const ActiveComponent = scatSections.find((section) => section.id === activeSection)?.component || EvaluacionContent;

	// Variables para el estado de las flechas
	const isPreviousDisabled = !canGoPrevious() || !isInitialized;
	const isNextDisabled = !canGoNext() || !isInitialized;

	// Mostrar pantalla de carga mientras se inicializa
	if (!isInitialized) {
		return (
			<div className={styles.container}>
				<div className={styles.loadingOverlay}>
					<div className={styles.loadingSpinner}></div>
					<p>Inicializando interfaz...</p>
					{formData?.isViewing && <p>Cargando datos del proyecto para visualización...</p>}
					{formData?.isEditing && <p>Cargando proyecto para edición (preservando todos los datos)...</p>}
				</div>
			</div>
		);
	}

	// Mostrar error de inicialización si existe
	if (initializationError) {
		return (
			<div className={styles.container}>
				<div className={styles.errorBanner}>
					<span>Error de inicialización: {initializationError}</span>
					<button onClick={() => window.location.reload()}>Recargar</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.headerLeft}>
						<button 
							className={styles.backToMenuButton}
							onClick={handleBackToMenu}
							title="Volver al menú principal (guarda automáticamente)"
						>
							← Menú Principal
						</button>
						{(isViewingMode || isEditingMode) && (
							<div className={styles.viewingIndicator}>
								<span className={isViewingMode ? styles.viewingBadge : styles.editingBadge}>
									{isViewingMode ? 'SOLO LECTURA' : 'EDITANDO'}
								</span>
								<span className={styles.viewingText}>
									{formData?.projectData?.name || projectData?.evento || 'Proyecto'}
								</span>
							</div>
						)}
					</div>
					<div className={styles.headerCenter}>
						{/* Espacio para título si es necesario */}
					</div>
					<div className={styles.headerRight}>
						<div className={styles.sectionCounter}>
							{getCurrentSectionIndex() + 1} de {scatSections.length}
						</div>
						<button 
							className={styles.completeButton}
							onClick={handleCompleteAnalysis}
							title="Finalizar análisis y ver resumen (guarda automáticamente)"
							disabled={isViewingMode && !hasData()}
						>
							{isViewingMode ? 'Ver Resumen' : 'Finalizar Análisis'}
						</button>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div className={styles.navigationContainer}>
				<div className={styles.navigationHeader}>
					<button 
						className={`${styles.navArrow} ${isPreviousDisabled ? styles.disabled : ''}`}
						onClick={goToPreviousSection}
						disabled={isPreviousDisabled}
						title={isPreviousDisabled ? 'No hay sección anterior' : 'Sección anterior'}
					>
						<ArrowLeftIcon />
					</button>
					<div className={styles.currentSectionTitle}>
						{scatSections.find(section => section.id === activeSection)?.title}
					</div>
					<button 
						className={`${styles.navArrow} ${isNextDisabled ? styles.disabled : ''}`}
						onClick={goToNextSection}
						disabled={isNextDisabled}
						title={isNextDisabled ? 'No hay sección siguiente' : 'Siguiente sección'}
					>
						<ArrowRightIcon />
					</button>
				</div>
				
				<div className={styles.navigationButtons}>
					{scatSections.map((section, index) => (
						<button
							key={section.id}
							onClick={() => handleSectionClick(section.id)}
							className={`${styles.navButton} ${
								activeSection === section.id ? styles.activeButton : ""
							}`}
							title={section.title}
							disabled={!isInitialized}
						>
							<div className={styles.navButtonNumber}>{index + 1}</div>
							<div className={styles.navButtonText}>{section.title}</div>
						</button>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className={styles.contentArea}>
				<ActiveComponent />
			</div>

			{/* Bottom Navigation */}
			<div className={styles.bottomNav}>
				<button 
					className={styles.iconButton}
					onClick={handleShowInfo}
					title="Información"
					disabled={!isInitialized}
				>
					<InfoIcon />
				</button>
				<button 
					className={styles.iconButton}
					onClick={handleSaveProgress}
					title={isViewingMode ? "Modo solo lectura" : "Guardar progreso manualmente"}
					disabled={!isInitialized}
				>
					<SaveIcon />
				</button>
				<button 
					className={`${styles.iconButton} ${styles.darkButton}`}
					onClick={handleShowGrid}
					title="Ver proyectos (guarda automáticamente)"
					disabled={!isInitialized}
				>
					<GridIcon />
				</button>
				<button
					className={`${styles.iconButton} ${styles.darkButton} ${isPreviousDisabled ? styles.disabled : ''}`}
					onClick={goToPreviousSection}
					disabled={isPreviousDisabled}
					title={isPreviousDisabled ? 'No hay sección anterior' : 'Sección anterior'}
				>
					<ArrowLeftIcon />
				</button>
				<button 
					className={`${styles.iconButton} ${styles.darkButton} ${isNextDisabled ? styles.disabled : ''}`}
					onClick={goToNextSection}
					disabled={isNextDisabled}
					title={isNextDisabled ? 'No hay sección siguiente' : 'Siguiente sección'}
				>
					<ArrowRightIcon />
				</button>
			</div>

			{/* Progress Indicator */}
			<div className={styles.progressIndicator}>
				<div className={styles.progressBar}>
					<div 
						className={styles.progressFill}
						style={{ width: `${((getCurrentSectionIndex() + 1) / scatSections.length) * 100}%` }}
					></div>
				</div>
				<div className={styles.progressText}>
					Progreso: {getCurrentSectionIndex() + 1}/{scatSections.length}
					{isViewingMode && (
						<span className={styles.viewingProgress}>
							{' '}(Solo lectura)
						</span>
					)}
					{isEditingMode && (
						<span className={styles.editingProgress}>
							{' '}(Editando)
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default ScatInterface;

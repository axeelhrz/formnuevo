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
		necesidadesControlData
	} = useScatData();

	// Debug: Mostrar datos cargados
	useEffect(() => {
		console.log('=== SCAT INTERFACE - DATOS ACTUALES ===');
		console.log('isViewingMode:', isViewingMode);
		console.log('isInitialized:', isInitialized);
		console.log('projectData:', projectData);
		console.log('evaluacionData:', evaluacionData);
		console.log('contactoData:', contactoData);
		console.log('causasInmediatasData:', causasInmediatasData);
		console.log('causasBasicasData:', causasBasicasData);
		console.log('necesidadesControlData:', necesidadesControlData);
	}, [isViewingMode, isInitialized, projectData, evaluacionData, contactoData, causasInmediatasData, causasBasicasData, necesidadesControlData]);

	// Inicialización del componente
	useEffect(() => {
		console.log('=== INICIALIZANDO SCAT INTERFACE ===');
		console.log('FormData:', formData);
		
		if (isInitialized) {
			console.log('Ya está inicializado, saltando...');
			return;
		}

		const initializeInterface = async () => {
			try {
				setInitializationError(null);
				
				if (formData) {
					if (formData.isViewing && formData.projectData) {
						// Modo visualización: cargar proyecto completo en solo lectura
						console.log('=== MODO VISUALIZACIÓN ===');
						console.log('Proyecto a visualizar:', formData.projectData);
						
						resetAllData();
						await new Promise(resolve => setTimeout(resolve, 100));
						
						const loadSuccess = loadProjectData(formData.projectData);
						if (!loadSuccess) {
							throw new Error('Error cargando datos del proyecto');
						}
						
						setIsViewingMode(true);
						console.log('=== PROYECTO CARGADO PARA VISUALIZACIÓN ===');
					} else {
						// Modo nuevo proyecto o continuación
						console.log('=== MODO NUEVO PROYECTO/CONTINUACIÓN ===');
						resetAllData();
						await new Promise(resolve => setTimeout(resolve, 50));
						setProjectData(formData);
						setIsViewingMode(false);
					}
				} else {
					// Sin datos: inicializar limpio
					console.log('=== SIN DATOS - INICIALIZACIÓN LIMPIA ===');
					resetAllData();
					setIsViewingMode(false);
				}
				
				setIsInitialized(true);
				console.log('=== INICIALIZACIÓN COMPLETADA ===');
				
			} catch (error) {
				console.error('Error en inicialización:', error);
				setInitializationError(error.message);
				setIsInitialized(true);
			}
		};

		initializeInterface();
	}, [formData, isInitialized, resetAllData, setProjectData, loadProjectData]);

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

	// Navegación principal
	const handleBackToMenu = useCallback(() => {
		console.log('=== NAVEGANDO AL MENÚ PRINCIPAL ===');
		
		if (!isViewingMode && hasData()) {
			const confirmed = window.confirm('¿Estás seguro de que quieres salir? Los datos se guardarán automáticamente.');
			if (!confirmed) return;
		}
		
		if (onNavigateToBase) {
			onNavigateToBase();
		}
	}, [isViewingMode, hasData, onNavigateToBase]);

	const handleShowGrid = useCallback(() => {
		console.log('=== NAVEGANDO A PROYECTOS ===');
		
		if (!isViewingMode && hasData()) {
			const confirmed = window.confirm('¿Estás seguro de que quieres ir a proyectos? Los datos se guardarán automáticamente.');
			if (!confirmed) return;
		}
		
		if (onNavigateToProjects) {
			onNavigateToProjects();
		}
	}, [isViewingMode, hasData, onNavigateToProjects]);

	const handleCompleteAnalysis = useCallback(() => {
		console.log('=== COMPLETANDO ANÁLISIS ===');
		
		if (!hasData()) {
			alert("Por favor, complete al menos una sección antes de finalizar el análisis.");
			return;
		}
		
		if (onNavigateToDescription) {
			onNavigateToDescription();
		}
	}, [hasData, onNavigateToDescription]);

	// Funciones de utilidad
	const handleSaveProgress = useCallback(() => {
		if (isViewingMode) {
			alert('Este proyecto está en modo solo lectura');
			return;
		}
		
		// Los datos se guardan automáticamente
		alert('Progreso guardado automáticamente');
	}, [isViewingMode]);

	const handleShowInfo = () => {
		const currentSection = scatSections.find(section => section.id === activeSection);
		alert(`Información sobre: ${currentSection?.title}`);
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
					{formData?.isViewing && <p>Cargando datos del proyecto...</p>}
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
							title="Volver al menú principal"
						>
							← Menú Principal
						</button>
						{isViewingMode && (
							<div className={styles.viewingIndicator}>
								<span className={styles.viewingBadge}>SOLO LECTURA</span>
								<span className={styles.viewingText}>
									{formData?.projectData?.name || 'Proyecto'}
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
							title="Finalizar análisis y ver resumen"
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
					title={isViewingMode ? "Modo solo lectura" : "Guardar progreso"}
					disabled={!isInitialized}
				>
					<SaveIcon />
				</button>
				<button 
					className={`${styles.iconButton} ${styles.darkButton}`}
					onClick={handleShowGrid}
					title="Ver proyectos"
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
				</div>
			</div>
		</div>
	);
}

export default ScatInterface;
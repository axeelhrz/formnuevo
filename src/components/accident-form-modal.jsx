"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./AccidentForm.module.css";
import { useScatData } from "../contexts/ScatContext";

export default function AccidentFormModal({ isOpen, onClose, onCreateProject, onContinue }) {
	const { setProjectData, getCompleteSummary, resetAllData, setCurrentProject } = useScatData();
	const [formData, setFormData] = useState({
		evento: "",
		involucrado: "",
		area: "",
		fechaHora: "",
		investigador: "",
		otrosDatos: "",
	});

	const [errors, setErrors] = useState({});
	const hasInitialized = useRef(false);
	const isCreatingProject = useRef(false); // Prevenir creación múltiple

	// Limpiar formulario cuando se abre el modal (solo una vez)
	useEffect(() => {
		if (isOpen && !hasInitialized.current) {
			console.log('=== MODAL ABIERTO - INICIALIZANDO FORMULARIO LIMPIO ===');
			resetForm();
			hasInitialized.current = true;
			isCreatingProject.current = false; // Reset flag
		} else if (!isOpen) {
			// Resetear la bandera cuando se cierra el modal
			hasInitialized.current = false;
			isCreatingProject.current = false;
		}
	}, [isOpen]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Limpiar error cuando el usuario empiece a escribir
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.evento.trim()) {
			newErrors.evento = "El evento es requerido";
		}

		if (!formData.involucrado.trim()) {
			newErrors.involucrado = "El involucrado es requerido";
		}

		if (!formData.area.trim()) {
			newErrors.area = "El área es requerida";
		}

		if (!formData.fechaHora.trim()) {
			newErrors.fechaHora = "La fecha y hora son requeridas";
		}

		if (!formData.investigador.trim()) {
			newErrors.investigador = "El investigador es requerido";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const createSingleProject = (dataToSave) => {
		// Prevenir creación múltiple
		if (isCreatingProject.current) {
			console.log('Ya se está creando un proyecto, saltando...');
			return null;
		}

		isCreatingProject.current = true;

		console.log('=== CREANDO PROYECTO ÚNICO ===');
		console.log('Datos del formulario:', dataToSave);

		// Obtener datos SCAT actuales del contexto
		const currentSummary = getCompleteSummary();
		console.log('Resumen completo actual:', currentSummary);

		// Verificar si hay datos SCAT reales
		const hasScatData = (
			// Evaluación
			Object.values(currentSummary.evaluacion || {}).some(v => v !== null && v !== undefined) ||
			// Contacto
			(currentSummary.contacto?.selectedIncidents?.length > 0) ||
			(currentSummary.contacto?.observation?.trim()) ||
			(currentSummary.contacto?.image) ||
			// Causas Inmediatas
			(currentSummary.causasInmediatas?.actos?.selectedItems?.length > 0) ||
			(currentSummary.causasInmediatas?.condiciones?.selectedItems?.length > 0) ||
			(currentSummary.causasInmediatas?.actos?.observation?.trim()) ||
			(currentSummary.causasInmediatas?.condiciones?.observation?.trim()) ||
			(currentSummary.causasInmediatas?.actos?.image) ||
			(currentSummary.causasInmediatas?.condiciones?.image) ||
			// Causas Básicas
			(currentSummary.causasBasicas?.personales?.selectedItems?.length > 0) ||
			(currentSummary.causasBasicas?.laborales?.selectedItems?.length > 0) ||
			(currentSummary.causasBasicas?.personales?.observation?.trim()) ||
			(currentSummary.causasBasicas?.laborales?.observation?.trim()) ||
			(currentSummary.causasBasicas?.personales?.image) ||
			(currentSummary.causasBasicas?.laborales?.image) ||
			// Necesidades de Control
			(currentSummary.necesidadesControl?.selectedItems?.length > 0) ||
			(currentSummary.necesidadesControl?.globalObservation?.trim()) ||
			(currentSummary.necesidadesControl?.globalImage) ||
			(currentSummary.necesidadesControl?.medidasCorrectivas?.trim())
		);

		// Preparar datos SCAT para guardar
		let scatDataToSave = null;
		if (hasScatData) {
			scatDataToSave = {
				evaluacion: currentSummary.evaluacion,
				contacto: currentSummary.contacto,
				causasInmediatas: currentSummary.causasInmediatas,
				causasBasicas: currentSummary.causasBasicas,
				necesidadesControl: currentSummary.necesidadesControl
			};
			console.log('Datos SCAT a guardar:', scatDataToSave);
		} else {
			console.log('No hay datos SCAT para guardar');
		}

		// Crear un nuevo proyecto con ID único y todos los datos necesarios
		const newProject = {
			id: Date.now(), // Usar timestamp como ID único
			name: dataToSave.evento,
			description: dataToSave.otrosDatos || `Involucrado: ${dataToSave.involucrado} - Área: ${dataToSave.area}`,
			createdAt: new Date().toISOString(),
			formData: { ...dataToSave }, // Guardar todos los datos del formulario
			scatData: scatDataToSave, // Incluir datos SCAT si existen
			// Metadatos adicionales
			status: 'active',
			lastModified: new Date().toISOString(),
			version: 1,
			isReal: true,
			isExample: false,
			isSimulated: false
		};

		console.log('Proyecto creado:', newProject);

		// Guardar proyecto inmediatamente en localStorage (UNA SOLA VEZ)
		try {
			const existingProjects = localStorage.getItem('scatProjects');
			const projects = existingProjects ? JSON.parse(existingProjects) : [];
			
			// Verificar que no existe ya un proyecto con el mismo ID
			const existingProject = projects.find(p => p.id === newProject.id);
			if (existingProject) {
				console.log('Proyecto ya existe, no se creará duplicado');
				return existingProject;
			}
			
			const updatedProjects = [newProject, ...projects];
			localStorage.setItem('scatProjects', JSON.stringify(updatedProjects));
			console.log('Proyecto guardado en localStorage (sin duplicados)');
		} catch (error) {
			console.error('Error guardando proyecto en localStorage:', error);
			isCreatingProject.current = false;
			return null;
		}

		// Establecer proyecto actual en el contexto DESPUÉS de guardarlo
		setCurrentProject(newProject.id);

		// Llamar al callback para actualizar la UI del dashboard
		if (onCreateProject) {
			onCreateProject(newProject);
		}

		return newProject;
	};

	const handleSaveOnly = (e) => {
		e.preventDefault();

		if (validateForm()) {
			console.log('=== GUARDAR SOLO ===');
			console.log('Datos del formulario:', formData);
			
			// Crear el proyecto UNA SOLA VEZ
			const createdProject = createSingleProject(formData);
			
			if (createdProject) {
				// Limpiar formulario y cerrar modal
				resetForm();
				onClose();
				
				// Mostrar mensaje de confirmación
				alert('Proyecto creado exitosamente y guardado en el dashboard.');
			} else {
				alert('Error al crear el proyecto. Por favor, intente nuevamente.');
			}
		}
	};

	const handleSaveAndContinue = (e) => {
		e.preventDefault();

		if (validateForm()) {
			console.log('=== GUARDAR Y CONTINUAR ===');
			console.log('Datos del formulario antes de crear:', formData);
			
			// Hacer una copia de los datos antes de proceder
			const dataToSave = { ...formData };
			
			// Crear el proyecto UNA SOLA VEZ
			const newProject = createSingleProject(dataToSave);
			
			if (newProject) {
				console.log('Proyecto creado para continuar:', newProject);
				
				// Establecer datos del proyecto en el contexto para continuar
				setProjectData(dataToSave);
				
				// Usar setTimeout para asegurar que el estado se actualice antes de navegar
				setTimeout(() => {
					// Limpiar formulario
					resetForm();
					
					// Navegar al SCAT con los datos originales
					if (onContinue) {
						console.log('Navegando al SCAT con datos:', dataToSave);
						onContinue(dataToSave);
					}
				}, 100); // Pequeño delay para asegurar que el estado se actualice
			} else {
				alert('Error al crear el proyecto. Por favor, intente nuevamente.');
			}
		}
	};

	const resetForm = () => {
		setFormData({
			evento: "",
			involucrado: "",
			area: "",
			fechaHora: "",
			investigador: "",
			otrosDatos: "",
		});
		setErrors({});
		isCreatingProject.current = false; // Reset flag
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>Nuevo Reporte de Accidente/Incidente</h2>
					<button className={styles.closeButton} onClick={handleCancel}>
						×
					</button>
				</div>

				<form className={styles.form}>
					<div className={styles.formGrid}>
						<div className={styles.formGroup}>
							<label htmlFor="evento" className={styles.label}>
								Evento *
							</label>
							<input
								type="text"
								id="evento"
								name="evento"
								value={formData.evento}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.evento ? styles.inputError : ""}`}
								placeholder="Descripción del evento"
							/>
							{errors.evento && (
								<span className={styles.errorMessage}>{errors.evento}</span>
							)}
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="involucrado" className={styles.label}>
								Involucrado *
							</label>
							<input
								type="text"
								id="involucrado"
								name="involucrado"
								value={formData.involucrado}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.involucrado ? styles.inputError : ""}`}
								placeholder="Persona involucrada"
							/>
							{errors.involucrado && (
								<span className={styles.errorMessage}>{errors.involucrado}</span>
							)}
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="area" className={styles.label}>
								Área *
							</label>
							<input
								type="text"
								id="area"
								name="area"
								value={formData.area}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.area ? styles.inputError : ""}`}
								placeholder="Área donde ocurrió"
							/>
							{errors.area && (
								<span className={styles.errorMessage}>{errors.area}</span>
							)}
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="fechaHora" className={styles.label}>
								Fecha y Hora *
							</label>
							<input
								type="datetime-local"
								id="fechaHora"
								name="fechaHora"
								value={formData.fechaHora}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.fechaHora ? styles.inputError : ""}`}
							/>
							{errors.fechaHora && (
								<span className={styles.errorMessage}>{errors.fechaHora}</span>
							)}
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="investigador" className={styles.label}>
								Investigador *
							</label>
							<input
								type="text"
								id="investigador"
								name="investigador"
								value={formData.investigador}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.investigador ? styles.inputError : ""}`}
								placeholder="Nombre del investigador"
							/>
							{errors.investigador && (
								<span className={styles.errorMessage}>{errors.investigador}</span>
							)}
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="otrosDatos" className={styles.label}>
								Otros Datos
							</label>
							<textarea
								id="otrosDatos"
								name="otrosDatos"
								value={formData.otrosDatos}
								onChange={handleInputChange}
								className={styles.textarea}
								placeholder="Información adicional relevante"
								rows={3}
							/>
						</div>
					</div>

					<div className={styles.formActions}>
						<button
							type="button"
							onClick={handleCancel}
							className={styles.cancelButton}
						>
							Cancelar
						</button>
						<button 
							type="button"
							onClick={handleSaveOnly}
							className={styles.saveButton}
							disabled={isCreatingProject.current}
						>
							{isCreatingProject.current ? 'Guardando...' : 'Guardar Proyecto'}
						</button>
						<button 
							type="button"
							onClick={handleSaveAndContinue}
							className={styles.submitButton}
							disabled={isCreatingProject.current}
						>
							{isCreatingProject.current ? 'Guardando...' : 'Guardar y Continuar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
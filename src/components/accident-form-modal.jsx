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
	const currentProjectRef = useRef(null);
	const autoSaveTimeoutRef = useRef(null);

	// CREAR PROYECTO INMEDIATAMENTE AL ABRIR EL MODAL
	useEffect(() => {
		if (isOpen && !hasInitialized.current) {
			console.log('=== MODAL ABIERTO - CREANDO PROYECTO INMEDIATAMENTE ===');
			
			// Limpiar formulario
			resetForm();
			
			// CREAR PROYECTO VACÍO INMEDIATAMENTE
			const newProject = createEmptyProject();
			if (newProject) {
				currentProjectRef.current = newProject;
				console.log('=== PROYECTO CREADO INMEDIATAMENTE ===', newProject.id);
			}
			
			hasInitialized.current = true;
		} else if (!isOpen) {
			hasInitialized.current = false;
			currentProjectRef.current = null;
		}
	}, [isOpen]);

	// AUTO-GUARDADO INMEDIATO CUANDO CAMBIAN LOS DATOS
	useEffect(() => {
		if (isOpen && currentProjectRef.current && hasInitialized.current) {
			// Limpiar timeout anterior
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}

			// Guardar después de 500ms de inactividad
			autoSaveTimeoutRef.current = setTimeout(() => {
				updateProjectWithCurrentData();
			}, 500);
		}

		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, [formData, isOpen]);

	// FUNCIÓN PARA CREAR PROYECTO VACÍO INMEDIATAMENTE
	const createEmptyProject = () => {
		try {
			console.log('=== CREANDO PROYECTO VACÍO INMEDIATAMENTE ===');

			// Obtener datos SCAT actuales (probablemente vacíos)
			const currentSummary = getCompleteSummary();

			// Crear proyecto con datos mínimos
			const newProject = {
				id: Date.now(),
				name: "Nuevo Proyecto",
				description: "Proyecto creado automáticamente",
				createdAt: new Date().toISOString(),
				
				// Datos del formulario (inicialmente vacíos)
				formData: {
					evento: "",
					involucrado: "",
					area: "",
					fechaHora: "",
					investigador: "",
					otrosDatos: ""
				},
				
				// Datos SCAT (inicialmente vacíos pero con estructura completa)
				scatData: {
					evaluacion: currentSummary.evaluacion || {
						severity: null,
						probability: null,
						frequency: null
					},
					contacto: currentSummary.contacto || {
						selectedIncidents: [],
						image: null,
						observation: ''
					},
					causasInmediatas: currentSummary.causasInmediatas || {
						actos: {
							selectedItems: [],
							image: null,
							observation: ''
						},
						condiciones: {
							selectedItems: [],
							image: null,
							observation: ''
						}
					},
					causasBasicas: currentSummary.causasBasicas || {
						personales: {
							selectedItems: [],
							detailedSelections: {},
							image: null,
							observation: ''
						},
						laborales: {
							selectedItems: [],
							detailedSelections: {},
							image: null,
							observation: ''
						}
					},
					necesidadesControl: currentSummary.necesidadesControl || {
						selectedItems: [],
						detailedData: {},
						globalImage: null,
						globalObservation: '',
						medidasCorrectivas: ''
					}
				},
				
				// Metadatos
				status: 'active',
				lastModified: new Date().toISOString(),
				version: 1,
				isReal: true,
				isExample: false,
				isSimulated: false,
				isAutoCreated: true // Marcar como creado automáticamente
			};

			// Guardar inmediatamente en localStorage
			const existingProjects = localStorage.getItem('scatProjects');
			const projects = existingProjects ? JSON.parse(existingProjects) : [];
			const updatedProjects = [newProject, ...projects];
			localStorage.setItem('scatProjects', JSON.stringify(updatedProjects));

			// Establecer como proyecto actual
			setCurrentProject(newProject.id);

			// Notificar al dashboard
			if (onCreateProject) {
				onCreateProject(newProject);
			}

			console.log('=== PROYECTO VACÍO CREADO Y GUARDADO ===', newProject);
			return newProject;

		} catch (error) {
			console.error('Error creando proyecto vacío:', error);
			return null;
		}
	};

	// FUNCIÓN PARA ACTUALIZAR PROYECTO CON DATOS ACTUALES
	const updateProjectWithCurrentData = () => {
		if (!currentProjectRef.current) {
			console.log('No hay proyecto actual para actualizar');
			return;
		}

		try {
			console.log('=== ACTUALIZANDO PROYECTO CON DATOS ACTUALES ===');
			
			const projectId = currentProjectRef.current.id;
			const savedProjects = localStorage.getItem('scatProjects');
			
			if (!savedProjects) {
				console.log('No hay proyectos guardados');
				return;
			}

			const projects = JSON.parse(savedProjects);
			const projectIndex = projects.findIndex(p => p.id === projectId);
			
			if (projectIndex === -1) {
				console.log('Proyecto no encontrado para actualizar');
				return;
			}

			// Actualizar con datos actuales del formulario
			const updatedProject = {
				...projects[projectIndex],
				// Actualizar nombre si hay evento
				name: formData.evento.trim() || "Nuevo Proyecto",
				description: formData.otrosDatos.trim() || 
					(formData.involucrado.trim() ? `Involucrado: ${formData.involucrado} - Área: ${formData.area}` : "Proyecto en progreso"),
				
				// Actualizar datos del formulario
				formData: {
					evento: formData.evento,
					involucrado: formData.involucrado,
					area: formData.area,
					fechaHora: formData.fechaHora,
					investigador: formData.investigador,
					otrosDatos: formData.otrosDatos
				},
				
				// Mantener datos SCAT existentes
				scatData: projects[projectIndex].scatData,
				
				// Actualizar metadatos
				lastModified: new Date().toISOString(),
				version: (projects[projectIndex].version || 1) + 1,
				isAutoCreated: true
			};

			projects[projectIndex] = updatedProject;
			localStorage.setItem('scatProjects', JSON.stringify(projects));
			
			// Actualizar referencia local
			currentProjectRef.current = updatedProject;

			console.log('=== PROYECTO ACTUALIZADO AUTOMÁTICAMENTE ===', updatedProject);

		} catch (error) {
			console.error('Error actualizando proyecto:', error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

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

	const handleSaveOnly = (e) => {
		e.preventDefault();

		if (!currentProjectRef.current) {
			alert('Error: No se pudo crear el proyecto');
			return;
		}

		// Actualizar una vez más con los datos finales
		updateProjectWithCurrentData();

		// Mostrar mensaje de confirmación
		const projectName = formData.evento.trim() || "Nuevo Proyecto";
		alert(`Proyecto "${projectName}" guardado exitosamente en el dashboard.`);
		
		resetForm();
		onClose();
	};

	const handleSaveAndContinue = (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		if (!currentProjectRef.current) {
			alert('Error: No se pudo crear el proyecto');
			return;
		}

		console.log('=== GUARDAR Y CONTINUAR ===');
		
		// Actualizar proyecto con datos finales
		updateProjectWithCurrentData();
		
		// Establecer datos del proyecto en el contexto
		setProjectData(formData);
		
		setTimeout(() => {
			resetForm();
			
			if (onContinue) {
				console.log('Navegando al SCAT con proyecto ID:', currentProjectRef.current.id);
				onContinue({
					...formData,
					projectId: currentProjectRef.current.id
				});
			}
		}, 100);
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
	};

	const handleCancel = () => {
		// El proyecto ya está guardado, solo cerrar
		if (currentProjectRef.current) {
			const projectName = currentProjectRef.current.name;
			console.log(`Proyecto "${projectName}" ya está guardado en el dashboard`);
		}
		
		resetForm();
		onClose();
	};

	// Limpiar timeout al cerrar
	useEffect(() => {
		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, []);

	if (!isOpen) return null;

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>
						Nuevo Reporte de Accidente/Incidente
						{currentProjectRef.current && (
							<span className={styles.autoSavedIndicator}>
								✓ Guardado automáticamente
							</span>
						)}
					</h2>
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
							Cerrar
						</button>
						<button 
							type="button"
							onClick={handleSaveOnly}
							className={styles.saveButton}
						>
							Finalizar y Guardar
						</button>
						<button 
							type="button"
							onClick={handleSaveAndContinue}
							className={styles.submitButton}
						>
							Continuar con SCAT
						</button>
					</div>
				</form>

				<div className={styles.autoSaveInfo}>
					<small>
						ℹ️ Este proyecto se guarda automáticamente mientras escribes. 
						Puedes cerrar esta ventana en cualquier momento y tus datos se mantendrán.
					</small>
				</div>
			</div>
		</div>
	);
}

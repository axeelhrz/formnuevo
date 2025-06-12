"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./AccidentForm.module.css";
import { useScatData } from "../contexts/ScatContext";

export default function AccidentFormModal({ isOpen, onClose, onCreateProject, onContinue }) {
	const { setProjectData } = useScatData();
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

	// Limpiar formulario cuando se abre el modal (solo una vez)
	useEffect(() => {
		if (isOpen && !hasInitialized.current) {
			console.log('=== MODAL ABIERTO - INICIALIZANDO FORMULARIO LIMPIO ===');
			resetForm();
			hasInitialized.current = true;
		} else if (!isOpen) {
			// Resetear la bandera cuando se cierra el modal
			hasInitialized.current = false;
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

	const createProject = (dataToSave) => {
		// Crear un nuevo proyecto con ID único y todos los datos necesarios
		const newProject = {
			id: Date.now(), // Usar timestamp como ID único
			name: dataToSave.evento,
			description: `Involucrado: ${dataToSave.involucrado} - Área: ${dataToSave.area}`,
			createdAt: new Date().toISOString(),
			formData: { ...dataToSave }, // Guardar todos los datos del formulario
			// Metadatos adicionales
			status: 'active',
			lastModified: new Date().toISOString(),
			version: 1
		};

		console.log('Creando proyecto con datos:', newProject);

		// Guardar en el contexto para uso inmediato en SCAT
		setProjectData(dataToSave);
		
		// Llamar al callback para crear el proyecto en el dashboard
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
			
			// Crear el proyecto
			createProject(formData);
			
			// Limpiar formulario y cerrar modal
			resetForm();
			onClose();
			
			// Mostrar mensaje de confirmación
			alert('Proyecto creado exitosamente y guardado en el dashboard.');
		}
	};

	const handleSaveAndContinue = (e) => {
		e.preventDefault();

		if (validateForm()) {
			console.log('=== GUARDAR Y CONTINUAR ===');
			console.log('Datos del formulario antes de crear:', formData);
			
			// Hacer una copia de los datos antes de limpiar el formulario
			const dataToSave = { ...formData };
			
			// Crear el proyecto con los datos guardados
			const newProject = createProject(dataToSave);
			
			console.log('Proyecto creado:', newProject);
			
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
						>
							Guardar Proyecto
						</button>
						<button 
							type="button"
							onClick={handleSaveAndContinue}
							className={styles.submitButton}
						>
							Guardar y Continuar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
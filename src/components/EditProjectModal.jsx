"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import styles from "./AccidentForm.module.css";
import pdfService from "../services/pdfService";
import { generatePDFDataFromProject } from "../utils/pdfDataNormalizer";

export default function EditProjectModal({ isOpen, onClose, project, onSave }) {
	const [formData, setFormData] = useState({
		evento: "",
		involucrado: "",
		area: "",
		fechaHora: "",
		investigador: "",
		otrosDatos: "",
	});
	const [errors, setErrors] = useState({});
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	// Cargar datos del proyecto cuando se abre el modal
	useEffect(() => {
		if (isOpen && project && project.formData) {
			console.log('=== CARGANDO PROYECTO EN EDIT MODAL ===');
			console.log('Proyecto completo:', project);
			
			setFormData({
				evento: project.formData.evento || "",
				involucrado: project.formData.involucrado || "",
				area: project.formData.area || "",
				fechaHora: project.formData.fechaHora || "",
				investigador: project.formData.investigador || "",
				otrosDatos: project.formData.otrosDatos || "",
			});
		}
	}, [isOpen, project]);

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

	const handleSave = (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		console.log('=== GUARDANDO CAMBIOS DEL PROYECTO ===');
		console.log('Datos del formulario:', formData);

		// Crear proyecto actualizado PRESERVANDO TODOS LOS DATOS SCAT
		const updatedProject = {
			...project, // Mantener toda la estructura existente
			name: formData.evento,
			description: formData.otrosDatos || 'Sin descripción',
			formData: formData, // Solo actualizar formData
			lastModified: new Date().toISOString(),
			version: (project.version || 1) + 1,
			// CRÍTICO: Preservar scatData completamente
			scatData: project.scatData || {}
		};

		console.log('Proyecto actualizado (preservando SCAT data):', updatedProject);

		// Llamar a la función onSave del padre
		onSave(updatedProject);
	};

	const handleCancel = () => {
		// Resetear formulario a los datos originales
		if (project && project.formData) {
			setFormData({
				evento: project.formData.evento || "",
				involucrado: project.formData.involucrado || "",
				area: project.formData.area || "",
				fechaHora: project.formData.fechaHora || "",
				investigador: project.formData.investigador || "",
				otrosDatos: project.formData.otrosDatos || "",
			});
		}
		setErrors({});
		onClose();
	};

	const handleGeneratePDF = async () => {
		if (!project) {
			alert('No hay datos del proyecto para generar el PDF');
			return;
		}

		try {
			setIsGeneratingPDF(true);
			console.log('=== GENERANDO PDF DESDE EDIT MODAL ===');
			console.log('Proyecto completo:', project);

			// Usar la función normalizada para generar datos PDF consistentes
			// Pasar los datos actuales del formulario para incluir cambios no guardados
			const normalizedData = generatePDFDataFromProject(project, formData);
			
			console.log('Datos normalizados para PDF:', normalizedData);

			// Generar y descargar PDF usando los datos normalizados
			await pdfService.downloadPDF(normalizedData);
			
			console.log('PDF generado exitosamente desde edit modal');
		} catch (error) {
			console.error('Error generando PDF:', error);
			alert('Error al generar el PDF. Por favor, intenta nuevamente.');
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Función para verificar si hay datos SCAT disponibles
	const hasScatData = (section) => {
		if (!project?.scatData) return false;
		
		switch (section) {
			case 'evaluacion':
				return project.scatData.evaluacion && 
					   (project.scatData.evaluacion.severity || 
						project.scatData.evaluacion.probability || 
						project.scatData.evaluacion.frequency);
			case 'contacto':
				return project.scatData.contacto && 
					   (project.scatData.contacto.selectedIncidents?.length > 0 ||
						project.scatData.contacto.observation ||
						project.scatData.contacto.image);
			case 'causasInmediatas':
				return project.scatData.causasInmediatas && 
					   (project.scatData.causasInmediatas.actos?.selectedItems?.length > 0 ||
						project.scatData.causasInmediatas.condiciones?.selectedItems?.length > 0 ||
						project.scatData.causasInmediatas.actos?.observation ||
						project.scatData.causasInmediatas.condiciones?.observation ||
						project.scatData.causasInmediatas.actos?.image ||
						project.scatData.causasInmediatas.condiciones?.image);
			case 'causasBasicas':
				return project.scatData.causasBasicas && 
					   (project.scatData.causasBasicas.personales?.selectedItems?.length > 0 ||
						project.scatData.causasBasicas.laborales?.selectedItems?.length > 0 ||
						project.scatData.causasBasicas.personales?.observation ||
						project.scatData.causasBasicas.laborales?.observation ||
						project.scatData.causasBasicas.personales?.image ||
						project.scatData.causasBasicas.laborales?.image);
			case 'necesidadesControl':
				return project.scatData.necesidadesControl && 
					   (project.scatData.necesidadesControl.selectedItems?.length > 0 ||
						project.scatData.necesidadesControl.globalObservation ||
						project.scatData.necesidadesControl.globalImage ||
						project.scatData.necesidadesControl.medidasCorrectivas);
			default:
				return false;
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>Editar Proyecto</h2>
					<button className={styles.closeButton} onClick={handleCancel}>
						×
					</button>
				</div>

				<form onSubmit={handleSave} className={styles.form}>
					<div className={styles.formGrid}>
						<div className={styles.formGroup}>
							<label className={styles.label}>Evento *</label>
							<input
								type="text"
								name="evento"
								value={formData.evento}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.evento ? styles.inputError : ''}`}
								placeholder="Describe el evento ocurrido"
							/>
							{errors.evento && <span className={styles.errorMessage}>{errors.evento}</span>}
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>Involucrado *</label>
							<input
								type="text"
								name="involucrado"
								value={formData.involucrado}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.involucrado ? styles.inputError : ''}`}
								placeholder="Nombre del involucrado"
							/>
							{errors.involucrado && <span className={styles.errorMessage}>{errors.involucrado}</span>}
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>Área *</label>
							<input
								type="text"
								name="area"
								value={formData.area}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.area ? styles.inputError : ''}`}
								placeholder="Área donde ocurrió el evento"
							/>
							{errors.area && <span className={styles.errorMessage}>{errors.area}</span>}
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>Fecha y Hora *</label>
							<input
								type="datetime-local"
								name="fechaHora"
								value={formData.fechaHora}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.fechaHora ? styles.inputError : ''}`}
							/>
							{errors.fechaHora && <span className={styles.errorMessage}>{errors.fechaHora}</span>}
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>Investigador *</label>
							<input
								type="text"
								name="investigador"
								value={formData.investigador}
								onChange={handleInputChange}
								className={`${styles.input} ${errors.investigador ? styles.inputError : ''}`}
								placeholder="Nombre del investigador"
							/>
							{errors.investigador && <span className={styles.errorMessage}>{errors.investigador}</span>}
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>Otros Datos</label>
							<textarea
								name="otrosDatos"
								value={formData.otrosDatos}
								onChange={handleInputChange}
								className={styles.textarea}
								placeholder="Información adicional relevante"
								rows={3}
							/>
						</div>
					</div>

					{/* Información del proyecto */}
					{project && (
						<div className={styles.projectInfo}>
							<h3>Información del Proyecto</h3>
							<div className={styles.projectDetails}>
								<p><strong>ID:</strong> {project.id}</p>
								<p><strong>Creado:</strong> {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'Fecha desconocida'}</p>
								{project.lastModified && (
									<p><strong>Última modificación:</strong> {new Date(project.lastModified).toLocaleString()}</p>
								)}
								<p><strong>Versión:</strong> {project.version || 1}</p>
							</div>

							{/* Información de datos SCAT */}
							<div className={styles.scatDataInfo}>
								<h4>Datos SCAT Disponibles:</h4>
								<div className={styles.scatDataStatus}>
									<span className={hasScatData('evaluacion') ? styles.available : styles.notAvailable}>
										Evaluación: {hasScatData('evaluacion') ? '✓' : '✗'}
									</span>
									<span className={hasScatData('contacto') ? styles.available : styles.notAvailable}>
										Contacto: {hasScatData('contacto') ? '✓' : '✗'}
									</span>
									<span className={hasScatData('causasInmediatas') ? styles.available : styles.notAvailable}>
										Causas Inmediatas: {hasScatData('causasInmediatas') ? '✓' : '✗'}
									</span>
									<span className={hasScatData('causasBasicas') ? styles.available : styles.notAvailable}>
										Causas Básicas: {hasScatData('causasBasicas') ? '✓' : '✗'}
									</span>
									<span className={hasScatData('necesidadesControl') ? styles.available : styles.notAvailable}>
										Necesidades de Control: {hasScatData('necesidadesControl') ? '✓' : '✗'}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className={styles.formActions}>
						<button
							type="button"
							onClick={handleGeneratePDF}
							disabled={isGeneratingPDF}
							className={styles.pdfButton}
						>
							<Download size={16} />
							{isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
						</button>
						<button type="button" onClick={handleCancel} className={styles.cancelButton}>
							Cancelar
						</button>
						<button type="submit" className={styles.saveButton}>
							Guardar Cambios
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
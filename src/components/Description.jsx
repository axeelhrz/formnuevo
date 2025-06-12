"use client";

import "./description.css";
import { useScatData } from "../contexts/ScatContext";
import pdfService from "../services/pdfService";
import { useEffect, useState } from "react";

export default function NextPage({ onGoBack, onStartNew }) {
	const { getCompleteSummary, resetAllData } = useScatData();
	const [projectSaved, setProjectSaved] = useState(false);

	// Guardar el proyecto automáticamente cuando se carga la página de descripción
	useEffect(() => {
		const saveCompletedProject = () => {
			try {
				console.log('=== GUARDANDO PROYECTO COMPLETADO ===');
				
				const scatData = getCompleteSummary();
				
				// Verificar que hay datos para guardar
				if (!scatData.project?.evento) {
					console.log('No hay datos del proyecto para guardar');
					return;
				}

				// Crear el proyecto completo
				const completedProject = {
					id: Date.now().toString(), // Generar ID único
					name: scatData.project.evento,
					description: scatData.project.otrosDatos || 'Análisis SCAT completado',
					createdAt: new Date().toISOString(),
					lastModified: new Date().toISOString(),
					version: 1,
					formData: {
						evento: scatData.project.evento,
						involucrado: scatData.project.involucrado,
						area: scatData.project.area,
						fechaHora: scatData.project.fechaHora,
						investigador: scatData.project.investigador,
						otrosDatos: scatData.project.otrosDatos
					},
					scatData: {
						evaluacion: scatData.evaluacion,
						contacto: scatData.contacto,
						causasInmediatas: scatData.causasInmediatas,
						causasBasicas: scatData.causasBasicas,
						necesidadesControl: scatData.necesidadesControl
					},
					isCompleted: true // Marcar como completado
				};

				// Obtener proyectos existentes
				const existingProjects = JSON.parse(localStorage.getItem('scatProjects') || '[]');
				
				// Verificar si ya existe un proyecto con los mismos datos básicos
				const existingProjectIndex = existingProjects.findIndex(p => 
					p.formData?.evento === completedProject.formData.evento &&
					p.formData?.involucrado === completedProject.formData.involucrado &&
					p.formData?.area === completedProject.formData.area
				);

				if (existingProjectIndex >= 0) {
					// Actualizar proyecto existente
					existingProjects[existingProjectIndex] = {
						...existingProjects[existingProjectIndex],
						...completedProject,
						id: existingProjects[existingProjectIndex].id, // Mantener ID original
						createdAt: existingProjects[existingProjectIndex].createdAt, // Mantener fecha de creación
						version: (existingProjects[existingProjectIndex].version || 1) + 1
					};
					console.log('Proyecto existente actualizado');
				} else {
					// Agregar nuevo proyecto
					existingProjects.unshift(completedProject);
					console.log('Nuevo proyecto guardado');
				}

				// Guardar en localStorage
				localStorage.setItem('scatProjects', JSON.stringify(existingProjects));
				setProjectSaved(true);
				
				console.log('=== PROYECTO GUARDADO EXITOSAMENTE ===');
				console.log('Proyecto guardado:', completedProject);
				
			} catch (error) {
				console.error('Error guardando proyecto completado:', error);
			}
		};

		// Guardar el proyecto solo una vez cuando se carga la página
		if (!projectSaved) {
			saveCompletedProject();
		}
	}, [getCompleteSummary, projectSaved]);

	const formatFieldValue = (value) => {
		return value && value.trim() !== "" ? value : "No especificado";
	};

	const handlePrint = () => {
		window.print();
	};

	const handleEmail = () => {
		const scatData = getCompleteSummary();
		const subject = encodeURIComponent("Reporte SCAT - Análisis Sistemático de Causas");
		
		let bodyContent = `
Reporte SCAT - Análisis Sistemático de Causas

=== INFORMACIÓN DEL PROYECTO ===
Evento: ${formatFieldValue(scatData.project?.evento)}
Involucrado: ${formatFieldValue(scatData.project?.involucrado)}
Área: ${formatFieldValue(scatData.project?.area)}
Fecha y Hora: ${formatFieldValue(scatData.project?.fechaHora)}
Investigador: ${formatFieldValue(scatData.project?.investigador)}
Otros Datos: ${formatFieldValue(scatData.project?.otrosDatos)}

=== EVALUACIÓN POTENCIAL DE PÉRDIDA ===`;

		if (scatData.evaluacion?.severity) {
			const severityMap = { A: 'Mayor', B: 'Grave', C: 'Menor' };
			bodyContent += `\nSeveridad: ${scatData.evaluacion.severity} - ${severityMap[scatData.evaluacion.severity]}`;
		}
		if (scatData.evaluacion?.probability) {
			const probabilityMap = { A: 'Alta', B: 'Moderada', C: 'Rara' };
			bodyContent += `\nProbabilidad: ${scatData.evaluacion.probability} - ${probabilityMap[scatData.evaluacion.probability]}`;
		}
		if (scatData.evaluacion?.frequency) {
			const frequencyMap = { A: 'Grande', B: 'Moderada', C: 'Baja' };
			bodyContent += `\nFrecuencia: ${scatData.evaluacion.frequency} - ${frequencyMap[scatData.evaluacion.frequency]}`;
		}

		if (scatData.contacto?.selectedIncidents?.length > 0) {
			bodyContent += `\n\n=== TIPOS DE CONTACTO ===\nIncidentes seleccionados: ${scatData.contacto.selectedIncidents.join(', ')}`;
		}

		if (scatData.causasInmediatas?.actos?.selectedItems?.length > 0) {
			bodyContent += `\n\n=== CAUSAS INMEDIATAS - ACTOS ===\nElementos seleccionados: ${scatData.causasInmediatas.actos.selectedItems.join(', ')}`;
		}

		if (scatData.causasInmediatas?.condiciones?.selectedItems?.length > 0) {
			bodyContent += `\n\n=== CAUSAS INMEDIATAS - CONDICIONES ===\nElementos seleccionados: ${scatData.causasInmediatas.condiciones.selectedItems.join(', ')}`;
		}

		bodyContent += `\n\nGenerado automáticamente por el Sistema SCAT`;

		const body = encodeURIComponent(bodyContent);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};

	const handleExportPDF = () => {
		try {
			const scatData = getCompleteSummary();
			
			// Generar nombre de archivo con fecha
			const now = new Date();
			const dateStr = now.toISOString().split('T')[0];
			const filename = `reporte-scat-${dateStr}.pdf`;
			
			pdfService.downloadPDF(scatData, filename);
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
		}
	};

	const handleStartNewReport = () => {
		resetAllData();
		onStartNew();
	};

	// Obtener resumen completo de datos
	const scatData = getCompleteSummary();

	// Mapas de traducción para evaluación
	const severityMap = { A: 'Mayor', B: 'Grave', C: 'Menor' };
	const probabilityMap = { A: 'Alta', B: 'Moderada', C: 'Rara' };
	const frequencyMap = { A: 'Grande', B: 'Moderada', C: 'Baja' };

	// Datos de referencia para mostrar textos completos
	const tiposContacto = [
		"Golpeado por (objeto en movimiento)",
		"Golpeado contra (persona en movimiento)",
		"Caída a distinto nivel",
		"Caída al mismo nivel",
		"Atrapado por (puntos de operación)",
		"Atrapado en (puntos de pellizco)",
		"Atrapado bajo (derrumbes)",
		"Contacto con (electricidad, calor, frío, radiación, cáusticos, tóxicos, ruido)",
		"Inhalación, absorción, ingestión",
		"Sobreesfuerzo"
	];

	const actosSubestandar = [
		"Operar equipos sin autorización",
		"Omitir el uso de equipos de seguridad personal",
		"Omitir el uso de dispositivos de seguridad",
		"Operar a velocidad inadecuada",
		"Poner fuera de servicio los dispositivos de seguridad",
		"Usar equipos defectuosos",
		"No usar o usar inadecuadamente el equipo de protección personal",
		"Cargar incorrectamente",
		"Colocar, mezclar, combinar, etc., de manera insegura",
		"Levantar objetos en forma incorrecta",
		"Adoptar una posición insegura para hacer el trabajo",
		"Trabajar en equipos en movimiento o peligrosos",
		"Distraerse, bromear, jugar, etc.",
		"Omitir el uso de equipos de protección personal disponibles",
		"Usar equipos inseguros o usarlos inseguramente"
	];

	const condicionesSubestandar = [
		"Guardas inadecuadas",
		"Equipos de protección inadecuados o insuficientes",
		"Herramientas, equipos o materiales defectuosos",
		"Espacio limitado para desenvolverse",
		"Sistemas de advertencia inadecuados",
		"Peligros de incendio y explosión",
		"Orden y limpieza deficientes en el lugar de trabajo",
		"Condiciones ambientales peligrosas",
		"Iluminación deficiente",
		"Ventilación deficiente",
		"Ropa o vestimenta insegura",
		"Congestión o acción restringida",
		"Ubicación peligrosa de equipos y materiales"
	];

	const factoresPersonales = [
		"Capacidad Física / Fisiológica Inadecuada",
		"Capacidad Mental / Psicológica Inadecuada",
		"Tensión Física o Fisiológica",
		"Tensión Mental o Psicológica",
		"Falta de Conocimiento",
		"Falta de Habilidad",
		"Motivación Incorrecta"
	];

	const factoresLaborales = [
		"Liderazgo y/o Supervisión Deficiente",
		"Ingeniería Inadecuada",
		"Adquisiciones Deficientes",
		"Mantenimiento Deficiente",
		"Herramientas y Equipos Inadecuados",
		"Estándares de Trabajo Inadecuados",
		"Uso y Desgaste",
		"Abuso o Mal Uso"
	];

	const necesidadesControl = [
		"Controles de Ingeniería",
		"Controles Administrativos",
		"Equipos de Protección Personal"
	];

	// Función para obtener texto de elemento por ID
	const getItemText = (items, id) => {
		const index = id - 1;
		return items[index] || `Elemento ${id}`;
	};

	return (
		<div className="next-page-container-wrapper full-screen">
			<div className="next-page-content full-width">
				<div className="next-page-container full-container">
					{/* Header compacto */}
					<div className="compact-header">
						<div className="status-badge">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Análisis SCAT Completado
						</div>
						<h1 className="compact-title">Reporte Completo del Análisis SCAT</h1>
						{projectSaved && (
							<div className="project-saved-indicator">
								✅ Proyecto guardado automáticamente
							</div>
						)}
					</div>

					{/* Información completa del formulario */}
					<div className="complete-form-data">
						{/* Información del Proyecto */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">📋</span>
								Información del Proyecto
							</h2>
							<div className="data-grid">
								<div className="data-item">
									<span className="data-label">Evento:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.evento)}</span>
								</div>
								<div className="data-item">
									<span className="data-label">Involucrado:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.involucrado)}</span>
								</div>
								<div className="data-item">
									<span className="data-label">Área:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.area)}</span>
								</div>
								<div className="data-item">
									<span className="data-label">Fecha y Hora:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.fechaHora)}</span>
								</div>
								<div className="data-item">
									<span className="data-label">Investigador:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.investigador)}</span>
								</div>
								<div className="data-item full-width">
									<span className="data-label">Otros Datos:</span>
									<span className="data-value">{formatFieldValue(scatData.project?.otrosDatos)}</span>
								</div>
							</div>
						</div>

						{/* Evaluación Potencial de Pérdida */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">⚠️</span>
								Evaluación Potencial de Pérdida
							</h2>
							<div className="evaluation-grid">
								<div className="evaluation-item">
									<span className="eval-label">Severidad:</span>
									<span className={`eval-value ${scatData.evaluacion?.severity?.toLowerCase()}`}>
										{scatData.evaluacion?.severity ? 
											`${scatData.evaluacion.severity} - ${severityMap[scatData.evaluacion.severity]}` : 
											"No especificado"
										}
									</span>
								</div>
								<div className="evaluation-item">
									<span className="eval-label">Probabilidad:</span>
									<span className={`eval-value ${scatData.evaluacion?.probability?.toLowerCase()}`}>
										{scatData.evaluacion?.probability ? 
											`${scatData.evaluacion.probability} - ${probabilityMap[scatData.evaluacion.probability]}` : 
											"No especificado"
										}
									</span>
								</div>
								<div className="evaluation-item">
									<span className="eval-label">Frecuencia:</span>
									<span className={`eval-value ${scatData.evaluacion?.frequency?.toLowerCase()}`}>
										{scatData.evaluacion?.frequency ? 
											`${scatData.evaluacion.frequency} - ${frequencyMap[scatData.evaluacion.frequency]}` : 
											"No especificado"
										}
									</span>
								</div>
							</div>
						</div>

						{/* Tipos de Contacto */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">🤝</span>
								Tipos de Contacto
							</h2>
							{scatData.contacto?.selectedIncidents?.length > 0 ? (
								<div className="items-list">
									{scatData.contacto.selectedIncidents.map((id, index) => (
										<div key={index} className="list-item">
											<span className="item-number">{id}</span>
											<span className="item-text">{getItemText(tiposContacto, id)}</span>
										</div>
									))}
								</div>
							) : (
								<p className="no-data">No se seleccionaron tipos de contacto</p>
							)}
							{scatData.contacto?.observation && (
								<div className="observation-box">
									<h4>Observaciones:</h4>
									<p>{scatData.contacto.observation}</p>
								</div>
							)}
						</div>

						{/* Causas Inmediatas */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">⚡</span>
								Causas Inmediatas
							</h2>
							
							{/* Actos Subestándar */}
							<div className="subsection">
								<h3 className="subsection-title">Actos Subestándar / Inseguros</h3>
								{scatData.causasInmediatas?.actos?.selectedItems?.length > 0 ? (
									<div className="items-list">
										{scatData.causasInmediatas.actos.selectedItems.map((id, index) => (
											<div key={index} className="list-item">
												<span className="item-number">{id}</span>
												<span className="item-text">{getItemText(actosSubestandar, id)}</span>
											</div>
										))}
									</div>
								) : (
									<p className="no-data">No se seleccionaron actos subestándar</p>
								)}
								{scatData.causasInmediatas?.actos?.observation && (
									<div className="observation-box">
										<h4>Observaciones:</h4>
										<p>{scatData.causasInmediatas.actos.observation}</p>
									</div>
								)}
							</div>

							{/* Condiciones Subestándar */}
							<div className="subsection">
								<h3 className="subsection-title">Condiciones Subestándar / Inseguras</h3>
								{scatData.causasInmediatas?.condiciones?.selectedItems?.length > 0 ? (
									<div className="items-list">
										{scatData.causasInmediatas.condiciones.selectedItems.map((id, index) => (
											<div key={index} className="list-item">
												<span className="item-number">{id}</span>
												<span className="item-text">{getItemText(condicionesSubestandar, id - 15)}</span>
											</div>
										))}
									</div>
								) : (
									<p className="no-data">No se seleccionaron condiciones subestándar</p>
								)}
								{scatData.causasInmediatas?.condiciones?.observation && (
									<div className="observation-box">
										<h4>Observaciones:</h4>
										<p>{scatData.causasInmediatas.condiciones.observation}</p>
									</div>
								)}
							</div>
						</div>

						{/* Causas Básicas */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">🔍</span>
								Causas Básicas / Subyacentes
							</h2>
							
							{/* Factores Personales */}
							<div className="subsection">
								<h3 className="subsection-title">Factores Personales</h3>
								{scatData.causasBasicas?.personales?.selectedItems?.length > 0 ? (
									<div className="items-list">
										{scatData.causasBasicas.personales.selectedItems.map((id, index) => (
											<div key={index} className="list-item">
												<span className="item-number">{id}</span>
												<span className="item-text">{getItemText(factoresPersonales, id)}</span>
												{scatData.causasBasicas.personales.detailedSelections?.[id]?.length > 0 && (
													<div className="detailed-items">
														{scatData.causasBasicas.personales.detailedSelections[id].map((detailIndex, idx) => (
															<span key={idx} className="detail-item">• Detalle {detailIndex + 1}</span>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="no-data">No se seleccionaron factores personales</p>
								)}
								{scatData.causasBasicas?.personales?.observation && (
									<div className="observation-box">
										<h4>Observaciones:</h4>
										<p>{scatData.causasBasicas.personales.observation}</p>
									</div>
								)}
							</div>

							{/* Factores Laborales */}
							<div className="subsection">
								<h3 className="subsection-title">Factores Laborales</h3>
								{scatData.causasBasicas?.laborales?.selectedItems?.length > 0 ? (
									<div className="items-list">
										{scatData.causasBasicas.laborales.selectedItems.map((id, index) => (
											<div key={index} className="list-item">
												<span className="item-number">{id}</span>
												<span className="item-text">{getItemText(factoresLaborales, id - 7)}</span>
												{scatData.causasBasicas.laborales.detailedSelections?.[id]?.length > 0 && (
													<div className="detailed-items">
														{scatData.causasBasicas.laborales.detailedSelections[id].map((detailIndex, idx) => (
															<span key={idx} className="detail-item">• Detalle {detailIndex + 1}</span>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="no-data">No se seleccionaron factores laborales</p>
								)}
								{scatData.causasBasicas?.laborales?.observation && (
									<div className="observation-box">
										<h4>Observaciones:</h4>
										<p>{scatData.causasBasicas.laborales.observation}</p>
									</div>
								)}
							</div>
						</div>

						{/* Necesidades de Control */}
						<div className="data-section">
							<h2 className="section-title">
								<span className="section-icon">🛡️</span>
								Necesidades de Acción de Control
							</h2>
							{scatData.necesidadesControl?.selectedItems?.length > 0 ? (
								<div className="items-list">
									{scatData.necesidadesControl.selectedItems.map((id, index) => (
										<div key={index} className="list-item">
											<span className="item-number">{id}</span>
											<span className="item-text">{getItemText(necesidadesControl, id)}</span>
											{scatData.necesidadesControl.detailedData?.[id] && (
												<div className="detailed-data">
													{scatData.necesidadesControl.detailedData[id].description && (
														<p><strong>Descripción:</strong> {scatData.necesidadesControl.detailedData[id].description}</p>
													)}
													{scatData.necesidadesControl.detailedData[id].responsible && (
														<p><strong>Responsable:</strong> {scatData.necesidadesControl.detailedData[id].responsible}</p>
													)}
													{scatData.necesidadesControl.detailedData[id].deadline && (
														<p><strong>Fecha límite:</strong> {scatData.necesidadesControl.detailedData[id].deadline}</p>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="no-data">No se identificaron necesidades de control</p>
							)}
							{scatData.necesidadesControl?.globalObservation && (
								<div className="observation-box">
									<h4>Observaciones Generales:</h4>
									<p>{scatData.necesidadesControl.globalObservation}</p>
								</div>
							)}
							{scatData.necesidadesControl?.medidasCorrectivas && (
								<div className="observation-box">
									<h4>Medidas Correctivas:</h4>
									<p>{scatData.necesidadesControl.medidasCorrectivas}</p>
								</div>
							)}
						</div>
					</div>

					{/* Botones de acción */}
					<div className="action-buttons-container">
						<div className="button-group primary-actions">
							<button onClick={handleStartNewReport} className="next-page-primary-button">
								<span className="action-button-with-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
									Nuevo Análisis
								</span>
							</button>
							<button onClick={onGoBack} className="next-page-secondary-button">
								<span className="action-button-with-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 19l-7-7m0 0l7-7m-7 7h18"
										/>
									</svg>
									Volver al Inicio
								</span>
							</button>
						</div>

						<div className="button-group secondary-actions">
							<button onClick={handlePrint} className="next-page-secondary-button">
								<span className="action-button-with-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
										/>
									</svg>
									Imprimir Reporte
								</span>
							</button>
							<button onClick={handleEmail} className="next-page-secondary-button">
								<span className="action-button-with-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
									Enviar por Email
								</span>
							</button>
							<button onClick={handleExportPDF} className="next-page-secondary-button">
								<span className="action-button-with-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Exportar PDF
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
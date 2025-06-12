"use client";

import { useState, useRef, useMemo } from "react";
import styles from "./NecesidadesControlContent.module.css";
import { useScatData } from "../../../contexts/ScatContext";

function NecesidadesControlContent() {
	const { necesidadesControlData, setNecesidadesControlData, causasBasicasData } = useScatData();
	const [activeModal, setActiveModal] = useState(null);
	const [modalData, setModalData] = useState({
		selectedOptions: [],
		optionsPEC: {},
		image: null,
		comments: ""
	});
	const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
	const [correctiveText, setCorrectiveText] = useState("");
	const fileInputRef = useRef(null);

	// Mapeo específico de Causas Básicas a NAC según las imágenes proporcionadas
	const causasBasicasToNAC = useMemo(() => ({
		// CB 1: Capacidad Física / Fisiológica Inadecuada
		1: [6, 9, 12, 15, 18],
		
		// CB 2: Capacidad Mental / Psicológica Inadecuada
		2: [6, 9, 10, 15, 18],
		
		// CB 3: Tensión Física o Fisiológica
		3: [4, 6, 9, 11, 12, 13, 15, 18, 20],
		
		// CB 4: Tensión Mental o Psicológica
		4: [1,4, 5, 6, 10, 11, 12, 15, 16, 18, 20],
		
		// CB 5: Falta de Conocimiento
		5: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20],
		
		// CB 6: Falta de Habilidad
		6: [2, 4, 5, 6, 7, 9, 10, 13, 15, 18],
		
		// CB 7: Motivación Incorrecta
		7: [1, 2, 4, 5, 6, 8, 10, 11, 13, 15, 17, 18],
		
		// CB 8: Liderazgo y/o Supervisión Deficiente
		8: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
		
		// CB 9: Ingeniería Inadecuada
		9: [1, 3, 4, 9, 12, 13, 14],
		
		// CB 10: Adquisiciones Deficientes
		10: [1, 3, 4, 6, 9, 12, 13, 14, 15, 19],
		
		// CB 11: Mantenimiento Deficiente
		11: [1, 3, 4, 6, 9, 10, 13, 15, 19],
		
		// CB 12: Herramientas y Equipos Inadecuados
		12: [1, 3, 4, 6, 7, 9, 11, 12, 13, 14, 15, 19],
		
		// CB 13: Estándares de Trabajo Inadecuados
		13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 19],
		
		// CB 14: Uso y Desgaste
		14: [3, 4, 6, 9, 10, 13, 14, 15],
		
		// CB 15: Abuso o Mal Uso
		15: [1, 3, 4, 6, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19]
	}), []);

	// Definición de todos los NAC según las imágenes
	const allNACItems = useMemo(() => [
		// NAC 1-5: Procedimientos de Investigación de Accidentes/Incidentes
		{ 
			id: 1, 
			text: "LIDERAZGO Y ADMINISTRACIÓN",
			title: "LIDERAZGO Y ADMINISTRACIÓN",
			options: [
				"Pólitica General",
				"Coordinador del Programa",
				"Participación de Gerencia Superior y Media",
				"Estándares de Desempeño Gerencial",
				"Participación de Gerencia",
				"Participación de Reuniones de Gerencia",
				"Manual de Referencia de Gerencia",
				"Realización de Auditorías de Gerencia",
				"Responsabilidad individual de Seguridad y Salud / Control de Pérdidas en Descripciones de Puestos",
				"Establecimiento de Objetivos Anuales de Seguridad y Salud / Control de Pérdidas",
				"Comités Conjuntos de Seguridad y Salud y/o Delegados de Seguridad y Salud",
				"Negativa a trabajar debido al Procedimiento de Peligros de Seguridad y Salud",
				"Biblioteca de Referencia"
			]
		},
		{ 
			id: 2, 
			text: "Entrenamiento de Gerencia",
			title: "ENTRENAMIENTO DE GERENCIA",
			options: [
				"Programa de Orientación/Inducción de Gerencia",
				"Entrenamiento Formal Inicial del Personal de Gerencia Superior",
				"Revisión Formal y Entrenamiento Actualizado del Personal de Gerencia Superior",
				"Entrenamiento Inicial Formal para Personal de Gerencia Media y Supervisores",
				"Revisión Formal y Entrenamiento Actualizado del Personal de Gerencia Media y Supervisores",
				"Entrenamiento Formal del Coordinador del Programa"
			]
		},
		{ 
			id: 3, 
			text: "Inspecciones Planificadas",
			title: "INSPECCIONES PLANIFICADAS",
			options: [
				"Inspecciones Generales Planificadas",
				"Procedimiento de Seguimiento",
				"Análisis de Informe de Inspección",
				"Programa de Inspección de Piezas/Rubros Criticos",
				"Programa de Mantenimiento Preventivo",
				"Insepcción Previa al uso de Equipo Movil y de Manipulación de Materiales",
				"Sistema de Informe de Condiciones Alternas",
				"Mantenimiento del Informe de Inspección General Planificada",
				"Monitoreo Regular del Programa"
			]
		},
		{ 
			id: 4, 
			text: "Análisis y Procedimientos de Tareas",
			title: "ANÁLISIS Y PROCEDIMIENTOS DE TAREAS",
			options: [
				"Directiva de Gerencia sobre la Importancia",
				"Inventario de Tareas Críticas",
				"Objetivo de Análisis de Tareas y Procedimientos de Tareas",
				"Análisis y Procedimientos de Tareas Efectuados para Tareas Críticas y Actualizados Periódicamente",
				"Peligros de Seguridad y Salud en los Análisis y Procedimientos de Tareas Críticas",
				"Monitoreo Regular del Programa"
			]
		},
		{ 
			id: 5, 
			text: "Investigación de Accidente / Incidente",
			title: "INVESTIGACIÓN DE ACCIDENTE / INCIDENTE",
			options: [
				"Procedimiento de Investigación de Accidentes/Incidentes",
				"Alcance e Investigaciones establecidos",
				"Seguimiento y Medidas de Corrección",
				"Utilización de Anuncio de Accidente Mayor",
				"Uso de Información de Alto Potencial de Incidente",
				"Participación de la Gerencia de Operaciones",
				"Informe e Investigación de Incidentes",
				"Mantenimiento de Informes de Accidente/Incidente",
				"Monitoreo Periódico del Programa"
			]
		},

		// NAC 6: Observación de Tareas
		{ 
			id: 6, 
			text: "Observación de Tareas",
			title: "OBSERVACIÓN DE TAREAS",
			options: [
				"Directiva de Gerencia sobre su Importancia",
				"Programa Completo de Observaciôn de Tareas",
				"Nivel de Observación Completa de Tareas",
				"Programa de Observación de Tareas Parciales",
				"Análisis de Informe de Observación de Tareas",
				"Monitoreo Periódico del Programa"
			]
		},

		// NAC 7: Preparación para Emergencias
		{ 
			id: 7, 
			text: "Preparación para Emergencias",
			title: "PREPARACIÓN PARA EMERGENCIAS",
			options: [
				"Coordinador Designado",
				"Plan de Emergencia por escrito",
				"Entrenamiento de Primeros Auxilios para Supervisor",
				"Entrenamiento de Primeros Auxilios para el Personal(10%)",
				"Iluminación y Energía de Emergencias Adecuadas",
				"Controles Principales con Código de Color y Rotulados",
				"Equipo de Protección y de Rescate",
				"Entrenamiento y Ejercicios del Equipo de Emergencias",
				"Asistentes de Primeros Auxilios Calificados",
				"Ayuda Exterior y Auxilio Mutuo Organizados",
				"Protección de Registros Vitales",
				"Planificación para Etapa Posterior al Evento",
				"Se provee Comunicación de Emergencia",
				"Comunicaciones de Seguridad Pública Planificadas"
			]
		},

		// NAC 8: Sistemas de Permisos de Trabajo y Procedimientos Especiales
		{ 
			id: 8, 
			text: "Reglamentos de la Compañia",
			title: "REGLAMENTOS DE LA COMPAÑIA",
			options: [
				"Reglamento General de Seguridad y Salud",
				"Reglamento de Trabajo Especializado",
				"Sistemas de Permiso de Trabajo y Procedimientos Especiales",
				"Programa de Educación y Revisión del Reglamento",
				"Esfuerzo de Cumplimiento del Reglamento",
				"Uso de Simbolos Educativos y Códigos de Colores",
				"Monitoreo Periódico del Programa"
			]
		},

		// NAC 9: Análisis de Accidente / Incidente
		{ 
			id: 9, 
			text: "Análisis de Accidente / Incidente",
			title: "ANÁLISIS DE ACCIDENTE / INCIDENTE",
			options: [
				"Cálculo y Uso de Estadísticas de Desempeño",
				"Análisis de Lesiones y Enfermedades Ocupacionales",
				"Identificación y Análisis de Incidentes de Propiedad y Equipo",
				"Equipos de Proyecto para Solución de Problemas",
				"Análisis de Incidentes Menores (Cuasi accidentes)"
			]
		},

		// NAC 10: Entrenamiento de Seguridad y Salud Ocupacional
		{ 
			id: 10, 
			text: "Entrenamiento del personal",
			title: "Entrenamiento del Personal",
			options: [
				"Análisis de Necesidades de Entrenamiento",
				"Programa de Entrenamiento del Personal",
				"Evaluación del Programa de Entrenamiento",
			]
		},

		// NAC 11: Estándares para Equipo de Protección Personal
		{ 
			id: 11, 
			text: "Equipo de Protección Personal",
			title: "EQUIPO DE PROTECCIÓN PERSONAL",
			options: [
				"Estándares para Equipo de Protección Personal",
				"Registro de Equipo de Protección Personal",
				"Cumplimiento de Estándares",
				"Monitoreo Periódico del Programa"
			]
		},

		// NAC 12: Control de la Salud
		{ 
			id: 12, 
			text: "Control de la Salud",
			title: "CONTROL DE LA SALUD",
			options: [
				"Identificación de Peligros para la Salud",
				"Control de Peligros de la Salud",
				"Información / Entrenamiento / Educación",
				"Monitoreo de Higiene Industrial",
				"Programa de Mantenimiento de la Salud",
				"Asistencia Médica Profesional",
				"Comunicaciones de Salud a los Trabajadores",
				"Mantenimiento de Registros"
			]
		},

		// NAC 13: Sistema de Evaluación del Programa
		{ 
			id: 13, 
			text: "Sistema de Evaluación del Programa",
			title: "SISTEMA DE EVALUACIÓN DEL PROGRAMA",
			options: [
				"Auditoría Completa del Cumplimiento de Estándares del Programa",
				"Auditoría Completa del Cumplimiento de Estándares de Condiciones Físicas",
				"Auditoría Completa del Cumplimiento de Estándares de Prevención y Control de Incendios",
				"Auditoría Completa del Cumplimiento de Estándares de Salud Ocupacional",
				"Registro de Sistemas de Evaluación de Programa"
			]
		},

		// NAC 14: Controles de Ingeniería
		{ 
			id: 14, 
			text: "Controles de Ingeniería",
			title: "CONTROLES DE INGENIERÍA",
			options: [
				"Consideraciones de Seguridad y Salud de Ingeniería de Diseño en la Concepción y el Diseño",
				"Consideraciones de Seguridad y Salud de Ingeniería de Proceso en la Concepción y el Diseño",
				"Monitoreo Periódico del Programa"
			]
		},

		// NAC 15: Comunicaciones al Personal
		{ 
			id: 15, 
			text: "Comunicaciones al Personal",
			title: "COMUNICACIONES AL PERSONAL",
			options: [
				"Entrenamiento y Motivación de Comunicación al Personal",
				"Orientación / Motivación de Trabajo para Personal Nuevo/Transferido",
				"Entrenamiento y Uso Adecuado de Instrucción de Tarea"
			]
		},

		// NAC 16: Liderazgo y Administración
		{ 
			id: 16, 
			text: "Reuniones Grupales",
			title: "REUNIONES GRUPALES",
			options: [
				"Realización de Reuniones Grupales",
				"Registro del Asunto, Ayudas Visuales, Asistencia y Problemas Tratados",
				"Participación de la Gerencia Superior y Media",
				"Monitoreo Periódico del Programa",
			]
		},

		// NAC 17: Contratación y Colocación de Personal
		{ 
			id: 17, 
			text: "Promoción General",
			title: "PROMOCIÓN GENERAL",
			options: [
				"Programa de Periódico Mural de Seguridad",
				"Uso de Estadísticas y Hechos del Programa",
				"Promoción de Temas Críticos",
				"Uso de Premios o Reconocimiento",
				"Publicaciones de Información del Programa",
				"Promoción del Desempeño en grupo",
				"Promoción del Orden y la Limpieza",
				"Registros de Actividades de Promoción del Programa"
			]
		},

		// NAC 18: Controles de Compra
		{ 
			id: 18, 
			text: "Contratación y Colocación de Personal",
			title: "CONTRATACIÓN Y COLOCACIÓN DE PERSONAL",
			options: [
				"Análisis de la Capacidad Física",
				"Examen Médico Pre-Ocupacional",
				"Programa de Orientación / Inducción General",
				"Identificación de Calificaciones Previa a la Contratación y Colocación"
			]
		},

		// NAC 19: Mantenimiento y Inspecciones
		{ 
			id: 19, 
			text: "Controles de Compra",
			title: "CONTROLES DE COMPRA",
			options: [
				"Compras Incluyen la Seguridad y Salud en las Especificaciones y Logística",
				"Selección y Control de Contratistas",
			]
		},

				{ 
			id: 20, 
			text: "Liderazgo y Administración",
			title: "LIDERAZGO Y ADMINISTRACIÓN",
			options: [
				"Establecimiento de Sistema de Informes y Análisis de Estádisticas",
				"Comunicación de Información de Seguridad Fuera del Trabajo",
			]
		}
	], []);

	// Cargar medidas correctivas existentes al inicializar
	useState(() => {
		if (necesidadesControlData.medidasCorrectivas) {
			setCorrectiveText(necesidadesControlData.medidasCorrectivas);
		}
	}, []);

	// Función para obtener los NAC filtrados según las selecciones de Causas Básicas
	const getFilteredNACItems = useMemo(() => {
		// Obtener todas las causas básicas seleccionadas
		const selectedCausasBasicas = [
			...causasBasicasData.personales.selectedItems,
			...causasBasicasData.laborales.selectedItems
		];

		if (selectedCausasBasicas.length === 0) {
			// Si no hay causas básicas seleccionadas, mostrar mensaje
			return [];
		}

		// Obtener los NAC permitidos basados en las causas básicas seleccionadas
		const allowedNACIds = new Set();
		selectedCausasBasicas.forEach(causaId => {
			const nacIds = causasBasicasToNAC[causaId];
			if (nacIds) {
				nacIds.forEach(nacId => allowedNACIds.add(nacId));
			}
		});

		// Filtrar los NAC para mostrar solo los permitidos
		return allNACItems.filter(item => allowedNACIds.has(item.id));

	}, [causasBasicasData.personales.selectedItems, causasBasicasData.laborales.selectedItems, allNACItems, causasBasicasToNAC]);

	const handleItemClick = (item) => {
		setActiveModal(item);
		
		// Cargar datos existentes si los hay
		const existingData = necesidadesControlData.detailedData[item.id];
		if (existingData) {
			setModalData(existingData);
		} else {
			setModalData({
				selectedOptions: [],
				optionsPEC: {},
				image: null,
				comments: ""
			});
		}
	};

	const handleOptionToggle = (optionIndex) => {
		setModalData(prev => ({
			...prev,
			selectedOptions: prev.selectedOptions.includes(optionIndex)
				? prev.selectedOptions.filter(i => i !== optionIndex)
				: [...prev.selectedOptions, optionIndex]
		}));
	};

	// Nueva función para manejar la selección de P E C por opción
	const handleOptionPECToggle = (optionIndex, pec) => {
		setModalData(prev => {
			const currentPECs = prev.optionsPEC[optionIndex] || [];
			const newPECs = currentPECs.includes(pec)
				? currentPECs.filter(p => p !== pec)
				: [...currentPECs, pec];
			
			return {
				...prev,
				optionsPEC: {
					...prev.optionsPEC,
					[optionIndex]: newPECs
				}
			};
		});
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setModalData(prev => ({
					...prev,
					image: e.target.result
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current.click();
	};

	const removeImage = () => {
		setModalData(prev => ({
			...prev,
			image: null
		}));
		fileInputRef.current.value = "";
	};

	const handleCommentsChange = (e) => {
		setModalData(prev => ({
			...prev,
			comments: e.target.value
		}));
	};

	const handleModalConfirm = () => {
		const hasData = modalData.selectedOptions.length > 0 || 
						modalData.image || 
						modalData.comments.trim() !== "" ||
						Object.keys(modalData.optionsPEC).length > 0;

		if (hasData) {
			// Agregar el item a selectedItems si no está
			const newSelectedItems = necesidadesControlData.selectedItems.includes(activeModal.id)
				? necesidadesControlData.selectedItems
				: [...necesidadesControlData.selectedItems, activeModal.id];
			
			// Guardar los datos detallados
			const newDetailedData = {
				...necesidadesControlData.detailedData,
				[activeModal.id]: modalData
			};

			setNecesidadesControlData({
				...necesidadesControlData,
				selectedItems: newSelectedItems,
				detailedData: newDetailedData
			});
		} else {
			// Si no hay datos, remover el item
			const newSelectedItems = necesidadesControlData.selectedItems.filter(id => id !== activeModal.id);
			const newDetailedData = { ...necesidadesControlData.detailedData };
			delete newDetailedData[activeModal.id];

			setNecesidadesControlData({
				...necesidadesControlData,
				selectedItems: newSelectedItems,
				detailedData: newDetailedData
			});
		}
		
		setActiveModal(null);
		setModalData({
			selectedOptions: [],
			optionsPEC: {},
			image: null,
			comments: ""
		});
	};

	const handleModalCancel = () => {
		setActiveModal(null);
		setModalData({
			selectedOptions: [],
			optionsPEC: {},
			image: null,
			comments: ""
		});
	};

	const clearAllSelections = () => {
		setNecesidadesControlData({
			selectedItems: [],
			detailedData: {},
			globalImage: null,
			globalObservation: '',
			medidasCorrectivas: ''
		});
		setCorrectiveText("");
	};

	const handleGlobalObservationChange = (e) => {
		setNecesidadesControlData({
			...necesidadesControlData,
			globalObservation: e.target.value
		});
	};

	// Funciones para el modal de medidas correctivas
	const handleOpenCorrectiveModal = () => {
		setCorrectiveText(necesidadesControlData.medidasCorrectivas || "");
		setShowCorrectiveModal(true);
	};

	const handleCloseCorrectiveModal = () => {
		setShowCorrectiveModal(false);
	};

	const handleSaveCorrectiveMeasures = () => {
		setNecesidadesControlData({
			...necesidadesControlData,
			medidasCorrectivas: correctiveText
		});
		setShowCorrectiveModal(false);
	};

	const handleCorrectiveTextChange = (e) => {
		setCorrectiveText(e.target.value);
	};

	const getSelectedCount = () => {
		return necesidadesControlData.selectedItems.length;
	};

	// Obtener las causas básicas seleccionadas para mostrar información
	const getSelectedCausasBasicas = () => {
		return [
			...causasBasicasData.personales.selectedItems,
			...causasBasicasData.laborales.selectedItems
		];
	};

	const selectedCausasBasicas = getSelectedCausasBasicas();
	const filteredNACItems = getFilteredNACItems;

	return (
		<div className={styles.scatContainer}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.mainTitle}>NECESIDADES DE ACCIÓN DE CONTROL (NAC)</h1>
					<h2 className={styles.subtitle}>Técnica de Análisis Sistemático de las Causas</h2>
				</div>
				<div className={styles.headerActions}>
					<button 
						className={styles.clearButton}
						onClick={clearAllSelections}
						disabled={necesidadesControlData.selectedItems.length === 0}
					>
						Limpiar Todo ({getSelectedCount()})
					</button>
				</div>
			</div>

			{/* Información sobre el filtrado */}
			{selectedCausasBasicas.length > 0 && (
				<div className={styles.filterInfo}>
					<h3>NAC filtradas según Causas Básicas seleccionadas:</h3>
					<p>Causas Básicas: {selectedCausasBasicas.join(', ')}</p>
					<p>Se muestran {filteredNACItems.length} NAC relacionadas con estas causas básicas.</p>
				</div>
			)}

			{filteredNACItems.length === 0 ? (
				<div className={styles.noOptionsMessage}>
					<h3>No hay NAC disponibles</h3>
					<p>Primero debe seleccionar causas básicas en la sección anterior (Botón 4) para ver las Necesidades de Acción de Control correspondientes.</p>
				</div>
			) : (
				<div className={styles.categoriesGridContainer}>
					<div className={styles.categoriesGrid}>
						{filteredNACItems.map((item) => {
							const isSelected = necesidadesControlData.selectedItems.includes(item.id);
							const hasDetailedData = necesidadesControlData.detailedData[item.id];
							
							return (
								<div key={item.id} className={styles.categoryCard}>
									<div 
										className={styles.categoryHeader}
										style={{ backgroundColor: '#f97316' }}
									>
										<h3 className={styles.categoryTitle}>NAC {item.id}</h3>
										<p className={styles.categorySubtitle}>{item.text}</p>
									</div>
									
									<div className={styles.categoryBody}>
										<button
											className={`${styles.itemButton} ${
												isSelected ? styles.selected : ""
											}`}
											onClick={() => handleItemClick(item)}
										>
											<div className={styles.itemNumber}>{item.id}</div>
											<div className={styles.itemText}>{item.text}</div>
											<div className={styles.itemIcon}>
												{isSelected ? "✓" : "→"}
											</div>
											{hasDetailedData && (
												<div className={styles.dataIndicator}>
													{hasDetailedData.selectedOptions?.length > 0 && 
														<span className={styles.optionsCount}>
															{hasDetailedData.selectedOptions.length} opciones
														</span>
													}
													{hasDetailedData.optionsPEC && Object.keys(hasDetailedData.optionsPEC).length > 0 && 
														<span className={styles.pecIndicator}>
															PEC: {Object.values(hasDetailedData.optionsPEC).flat().length}
														</span>
													}
												</div>
											)}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Global Observation Section */}
			<div className={styles.globalObservationSection}>
				<h3 className={styles.globalObservationTitle}>Observaciones Generales</h3>
				<textarea
					className={styles.globalObservationTextarea}
					value={necesidadesControlData.globalObservation || ''}
					onChange={handleGlobalObservationChange}
					placeholder="Escriba observaciones generales sobre las necesidades de control identificadas..."
					rows={4}
				></textarea>
			</div>

			{/* Botón de Medidas Correctivas */}
			<div className={styles.correctiveMeasuresSection}>
				<button 
					className={styles.correctiveMeasuresButton}
					onClick={handleOpenCorrectiveModal}
				>
					<div className={styles.correctiveMeasuresIcon}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 20h9"></path>
							<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
						</svg>
					</div>
					<span>Aplicar Medidas Correctivas</span>
					{necesidadesControlData.medidasCorrectivas && (
						<div className={styles.correctiveMeasuresIndicator}>
							✓ Completado
						</div>
					)}
				</button>
			</div>

			<div className={styles.footer}>
				<div className={styles.footerContent}>
					<div className={styles.legend}>
						<div className={styles.legendItem}>
							<div className={styles.legendColor} style={{ backgroundColor: '#dc2626' }}></div>
							<span>P - Potencial</span>
						</div>
						<div className={styles.legendItem}>
							<div className={styles.legendColor} style={{ backgroundColor: '#eab308' }}></div>
							<span>E - Eventos</span>
						</div>
						<div className={styles.legendItem}>
							<div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
							<span>C - Control</span>
						</div>
					</div>
				</div>
			</div>

			{/* Modal */}
			{activeModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<div className={styles.modalHeader}>
							<h3 className={styles.modalTitle}>
								{activeModal.title}
							</h3>
							<button 
								className={styles.modalCloseBtn}
								onClick={handleModalCancel}
							>
								×
							</button>
						</div>
						
						<div className={styles.modalBody}>
							{/* Options Selection with P-E-C buttons */}
							<div className={styles.optionsSection}>
								<h4 className={styles.optionsTitle}>Seleccione las opciones que aplican:</h4>
								<div className={styles.modalOptions}>
									{activeModal.options.map((option, index) => (
										<div key={index} className={styles.optionContainer}>
											<button
												className={`${styles.modalOption} ${
													modalData.selectedOptions.includes(index) ? styles.modalOptionSelected : ""
												}`}
												onClick={() => handleOptionToggle(index)}
											>
												<div className={styles.modalOptionIcon}>
													{modalData.selectedOptions.includes(index) ? "✓" : "○"}
												</div>
												<span className={styles.modalOptionText}>{option}</span>
											</button>
											
											{/* Botones P E C al costado de cada opción */}
											<div className={styles.optionPECButtons}>
												<button
													className={`${styles.optionPECButton} ${styles.optionPECP} ${
														modalData.optionsPEC[index]?.includes('P') ? styles.optionPECSelected : ""
													}`}
													onClick={() => handleOptionPECToggle(index, 'P')}
													title="Potencial"
												>
													P
												</button>
												<button
													className={`${styles.optionPECButton} ${styles.optionPECE} ${
														modalData.optionsPEC[index]?.includes('E') ? styles.optionPECSelected : ""
													}`}
													onClick={() => handleOptionPECToggle(index, 'E')}
													title="Eventos"
												>
													E
												</button>
												<button
													className={`${styles.optionPECButton} ${styles.optionPECC} ${
														modalData.optionsPEC[index]?.includes('C') ? styles.optionPECSelected : ""
													}`}
													onClick={() => handleOptionPECToggle(index, 'C')}
													title="Control"
												>
													C
												</button>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Image Upload */}
							<div className={styles.imageSection}>
								<h4 className={styles.imageTitle}>Imagen (opcional)</h4>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleImageUpload}
									accept="image/*"
									className={styles.fileInput}
								/>

								{modalData.image ? (
									<div className={styles.imagePreviewContainer}>
										<img
											src={modalData.image}
											alt="Preview"
											className={styles.imagePreview}
										/>
										<button className={styles.removeImageBtn} onClick={removeImage}>
											×
										</button>
									</div>
								) : (
									<div
										className={styles.uploadPlaceholder}
										onClick={triggerFileInput}
									>
										<div className={styles.cameraIcon}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
												<circle cx="12" cy="13" r="4"></circle>
											</svg>
										</div>
										<p>Haga clic para agregar imagen</p>
									</div>
								)}
							</div>

							{/* Comments */}
							<div className={styles.commentsSection}>
								<h4 className={styles.commentsTitle}>Comentarios</h4>
								<textarea
									className={styles.commentsTextarea}
									value={modalData.comments}
									onChange={handleCommentsChange}
									placeholder="Escriba sus comentarios aquí..."
									rows={4}
								></textarea>
							</div>
						</div>
						
						<div className={styles.modalFooter}>
							<button 
								className={styles.modalCancelBtn}
								onClick={handleModalCancel}
							>
								Cancelar
							</button>
							<button 
								className={styles.modalConfirmBtn}
								onClick={handleModalConfirm}
							>
								Confirmar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal para Medidas Correctivas */}
			{showCorrectiveModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.correctiveModalContent}>
						<div className={styles.modalHeader}>
							<h3 className={styles.modalTitle}>
								Medidas Correctivas
							</h3>
							<button 
								className={styles.modalCloseBtn}
								onClick={handleCloseCorrectiveModal}
							>
								×
							</button>
						</div>
						
						<div className={styles.correctiveModalBody}>
							<div className={styles.correctiveInstructions}>
								<p>Describa las medidas correctivas que se implementarán para abordar las necesidades de control identificadas:</p>
							</div>
							
							<textarea
								className={styles.correctiveTextarea}
								value={correctiveText}
								onChange={handleCorrectiveTextChange}
								placeholder="Escriba aquí las medidas correctivas detalladas, incluyendo:
- Acciones específicas a implementar
- Responsables de cada acción
- Plazos de implementación
- Recursos necesarios
- Indicadores de seguimiento"
								rows={15}
							></textarea>
						</div>
						
						<div className={styles.modalFooter}>
							<button 
								className={styles.modalCancelBtn}
								onClick={handleCloseCorrectiveModal}
							>
								Cancelar
							</button>
							<button 
								className={styles.modalConfirmBtn}
								onClick={handleSaveCorrectiveMeasures}
							>
								Guardar Medidas Correctivas
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default NecesidadesControlContent;
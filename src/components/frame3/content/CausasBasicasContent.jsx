"use client";

import { useState, useRef } from "react";
import styles from "./CausasBasicasContent.module.css";
import { useScatData } from "../../../contexts/ScatContext";

function CausasBasicasContent() {
	const { causasBasicasData, setCausasBasicasData, causasInmediatasData } = useScatData();
	const [activeSection, setActiveSection] = useState(null);
	const [activeModal, setActiveModal] = useState(null);
	const [modalSelectedItems, setModalSelectedItems] = useState([]);
	const [showAllItems, setShowAllItems] = useState(false);
	const fileInputRef = useRef(null);

	const factoresPersonales = [
		{ 
			id: 1, 
			text: "Capacidad Física / Fisiológica Inadecuada",
			options: [
				"Altura, peso, talla, fuerza, alcance, etc. inadecuados",
				"Capacidad de movimiento corporal limitada",
				"Capacidad limitada para mantenerse en determinadas posiciones corporales",
				"Limitaciones sensoriales (vista, oído, tacto, gusto, olfato, equilibrio)",
				"Incapacidad respiratoria o circulatoria",
				"Otras deficiencias físicas permanentes",
				"Deficiencias temporales"
			]
		},
		{ 
			id: 2, 
			text: "Capacidad Mental / Psicológica Inadecuada",
			options: [
				"Temores y fobias",
				"Problemas emocionales",
				"Enfermedad mental",
				"Nivel de inteligencia",
				"Incapacidad de comprensión",
				"Falta de juicio",
				"Deficiencias de coordinación",
				"Tiempo de reacción lento",
				"Aptitud mecánica deficiente",
				"Baja aptitud de aprendizaje"
			]
		},
		{ 
			id: 3, 
			text: "Tensión Física o Fisiológica",
			options: [
				"Lesión o enfermedad",
				"Fatiga debido a la carga o duración de las tareas",
				"Fatiga debido a la falta de descanso",
				"Fatiga debido a sobrecarga sensorial",
				"Exposición a riesgos contra la salud",
				"Exposición a temperaturas extremas",
				"Insuficiencia de oxígeno",
				"Variaciones en la presión atmosférica",
				"Vibración",
				"Movimiento restringido",
				"Insuficiencia de azúcar en la sangre"
			]
		},
		{ 
			id: 4, 
			text: "Tensión Mental o Psicológica",
			options: [
				"Sobrecarga emocional",
				"Fatiga debido a la carga o las exigencias mentales de la tarea",
				"Preocupaciones debido a problemas",
				"Frustración",
				"Enfermedad mental",
				"Sobrecarga sensorial"
			]
		},
		{ 
			id: 5, 
			text: "Falta de Conocimiento",
			options: [
				"Falta de experiencia",
				"Orientación deficiente",
				"Entrenamiento inicial inadecuado",
				"Reentrenamiento insuficiente",
				"Órdenes mal interpretadas"
			]
		},
		{ 
			id: 6, 
			text: "Falta de Habilidad",
			options: [
				"Instrucción inicial inadecuada",
				"Práctica insuficiente",
				"Operación esporádica",
				"Falta de preparación"
			]
		},
		{ 
			id: 7, 
			text: "Motivación Incorrecta",
			options: [
				"El desempeño subestándar es más gratificante",
				"El desempeño estándar causa desagrado",
				"Falta de incentivos",
				"Demasiadas frustraciones",
				"Falta de desafío",
				"No existe intención de ahorro de tiempo y esfuerzo",
				"Presión indebida de los compañeros",
				"Ejemplo deficiente por parte de la supervisión",
				"Retroalimentación deficiente con respecto al desempeño",
				"Falta de refuerzo positivo para el comportamiento correcto",
				"Incentivos de producción inadecuados"
			]
		}
	];

	const factoresLaborales = [
		{ 
			id: 8, 
			text: "Liderazgo y/o Supervisión Deficiente",
			options: [
				"Relaciones jerárquicas poco claras o conflictivas",
				"Asignación de responsabilidades poco clara o conflictiva",
				"Delegación inadecuada o insuficiente",
				"Definición inadecuada de políticas, procedimientos, prácticas o líneas de acción",
				"Formulación inadecuada de objetivos, metas o normas",
				"Programación o planificación inadecuada del trabajo",
				"Instrucción, orientación y/o entrenamiento inadecuados",
				"Provisión inadecuada de referencia, instrucción y orientación",
				"Identificación y evaluación inadecuadas de exposiciones a pérdidas",
				"Falta de conocimiento en el trabajo de supervisión/administración"
			]
		},
		{ 
			id: 9, 
			text: "Ingeniería Inadecuada",
			options: [
				"Evaluación inadecuada de exposiciones a pérdidas",
				"Preocupación inadecuada por los factores humanos/ergonómicos",
				"Normas, especificaciones o criterios de diseño inadecuados",
				"Control e inspección inadecuados de las construcciones",
				"Evaluación inadecuada para el uso operacional",
				"Evaluación inadecuada de la condición para el uso operacional",
				"Análisis inadecuado de tareas"
			]
		},
		{ 
			id: 10, 
			text: "Adquisiciones Deficientes",
			options: [
				"Especificaciones deficientes en cuanto a los requerimientos",
				"Investigación inadecuada acerca de materiales y equipos",
				"Especificaciones deficientes para los vendedores",
				"Modalidad o ruta de embarque inadecuada",
				"Inspecciones de recepción y aceptación inadecuadas",
				"Comunicación inadecuada de las informaciones sobre aspectos de seguridad y salud",
				"Manejo inadecuado de los materiales"
			]
		},
		{ 
			id: 11, 
			text: "Mantenimiento Deficiente",
			options: [
				"Aspectos preventivos inadecuados para evaluación de necesidades",
				"Aspectos preventivos inadecuados para lubricación y servicio",
				"Aspectos preventivos inadecuados para ajuste/ensamblaje",
				"Aspectos preventivos inadecuados para limpieza o pulimento",
				"Aspectos correctivos inadecuados para comunicación de necesidades",
				"Aspectos correctivos inadecuados para programación del trabajo",
				"Aspectos correctivos inadecuados para revisión de las piezas",
				"Aspectos correctivos inadecuados para procedimientos de reparación"
			]
		},
		{ 
			id: 12, 
			text: "Herramientas y Equipos Inadecuados",
			options: [
				"Evaluación inadecuada de necesidades y riesgos",
				"Preocupación inadecuada por los factores humanos/ergonómicos",
				"Normas o especificaciones inadecuadas",
				"Disponibilidad inadecuada",
				"Ajustes/reparación/mantenimiento deficientes",
				"Sistema inadecuado de reparación y recuperación",
				"Remoción y reemplazo inadecuados"
			]
		},
		{ 
			id: 13, 
			text: "Estándares de Trabajo Inadecuados",
			options: [
				"Desarrollo inadecuado de normas para inventarios y evaluación de exposiciones y necesidades",
				"Desarrollo inadecuado de normas para coordinación con quienes diseñan el proceso",
				"Desarrollo inadecuado de normas para compromiso del trabajador",
				"Desarrollo inadecuado de normas para estándares/procedimientos/reglas inconsistentes",
				"Comunicación inadecuada de las normas",
				"Mantenimiento inadecuado de las normas"
			]
		},
		{ 
			id: 14, 
			text: "Uso y Desgaste",
			options: [
				"Planificación inadecuada del uso",
				"Prolongación excesiva de la vida útil de elementos",
				"Inspección y/o control inadecuados",
				"Sobrecarga o sobreutilización",
				"Mantenimiento inadecuado",
				"Empleo del elemento por personas no calificadas o sin preparación"
			]
		},
		{ 
			id: 15, 
			text: "Abuso o Mal Uso",
			options: [
				"Uso por personas no calificadas o sin preparación",
				"Uso inadecuado para otros propósitos",
				"Uso inadecuado como herramienta",
				"Operación inadecuada",
				"Mantenimiento inadecuado",
				"Uso a sabiendas de que está defectuoso"
			]
		}
	];

	// Mapeo de Causas Inmediatas a Causas Básicas
	const ciToCBMapping = [
		// Actos Subestándar (1-15) -> Factores Personales y Laborales
		{ ci: 1, cb: [2, 4, 5, 7, 8, 12, 13, 15] }, // Operar equipos sin autorización
		{ ci: 2, cb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Omitir el uso de equipos de seguridad personal
		{ ci: 3, cb: [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Omitir el uso de dispositivos de seguridad
		{ ci: 4, cb: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15] }, // Operar a velocidad inadecuada
		{ ci: 5, cb: [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Poner fuera de servicio los dispositivos de seguridad
		{ ci: 6, cb: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // Usar equipos defectuosos
		{ ci: 7, cb: [2, 3, 4, 5, 7, 8, 10, 12, 13, 15] }, // No usar o usar inadecuadamente el EPP
		{ ci: 8, cb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15] }, // Cargar incorrectamente
		{ ci: 9, cb: [2, 5, 6, 8, 13] }, // Colocar, mezclar, combinar de manera insegura
		{ ci: 10, cb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Levantar objetos incorrectamente
		{ ci: 11, cb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Adoptar posición insegura
		{ ci: 12, cb: [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15] }, // Trabajar en equipos en movimiento
		{ ci: 13, cb: [2, 3, 4, 5, 7, 8, 13, 15] }, // Distraerse, bromear, jugar
		{ ci: 14, cb: [2, 3, 4, 5, 7, 8, 13, 15] }, // Omitir uso de EPP disponibles
		{ ci: 15, cb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15] }, // Usar equipos inseguros

		// Condiciones Subestándar (16-28) -> Principalmente Factores Laborales
		{ ci: 16, cb: [2, 4, 5, 7, 8, 12, 13, 15] }, // Guardas inadecuadas
		{ ci: 17, cb: [5, 7, 8, 9, 10, 12, 13] }, // Equipos de protección inadecuados
		{ ci: 18, cb: [8, 9, 10, 11, 12, 13, 14, 15] }, // Herramientas defectuosas
		{ ci: 19, cb: [8, 9, 13] }, // Espacio limitado
		{ ci: 20, cb: [8, 9, 10, 11, 12, 13] }, // Sistemas de advertencia inadecuados
		{ ci: 21, cb: [5, 6, 7, 8, 9, 10, 11, 12, 13, 15] }, // Peligros de incendio y explosión
		{ ci: 22, cb: [5, 6, 7, 8, 9, 10, 11, 12, 13, 15] }, // Orden y limpieza deficientes
		{ ci: 23, cb: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }, // Condiciones ambientales peligrosas
		{ ci: 24, cb: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }, // Iluminación deficiente
		{ ci: 25, cb: [1, 2, 3, 8, 9, 11, 12] }, // Ventilación deficiente
		{ ci: 26, cb: [8, 9, 10, 11, 12, 13] }, // Ropa o vestimenta insegura
		{ ci: 27, cb: [8, 9, 10, 11, 12, 13] }, // Congestión o acción restringida
		{ ci: 28, cb: [8, 9, 10, 11, 12, 13] }, // Ubicación peligrosa de equipos
	];

	// Función para obtener las CBs relevantes basadas en las CIs seleccionadas
	const getRelevantCBs = () => {
		const allSelectedCIs = [
			...causasInmediatasData.actos.selectedItems,
			...causasInmediatasData.condiciones.selectedItems
		];

		if (allSelectedCIs.length === 0) {
			return [];
		}

		const relevantCBs = new Set();
		allSelectedCIs.forEach(ciId => {
			const mapping = ciToCBMapping.find(m => m.ci === ciId);
			if (mapping) {
				mapping.cb.forEach(cbId => relevantCBs.add(cbId));
			}
		});

		return Array.from(relevantCBs).sort((a, b) => a - b);
	};

	// Función para filtrar items basado en las CBs relevantes
	const getFilteredItems = (items) => {
		if (showAllItems) {
			return items;
		}

		const allSelectedCIs = [
			...causasInmediatasData.actos.selectedItems,
			...causasInmediatasData.condiciones.selectedItems
		];

		if (allSelectedCIs.length === 0) {
			return items;
		}

		const relevantCBs = getRelevantCBs();
		return items.filter(item => relevantCBs.includes(item.id));
	};

	// Función para obtener las CIs seleccionadas con sus nombres
	const getSelectedCausasInmediatas = () => {
		const actosNames = [
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

		const condicionesNames = [
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

		const selectedCIs = [];

		causasInmediatasData.actos.selectedItems.forEach(id => {
			if (id >= 1 && id <= 15) {
				selectedCIs.push({
					id,
					text: actosNames[id - 1],
					type: 'Acto Subestándar'
				});
			}
		});

		causasInmediatasData.condiciones.selectedItems.forEach(id => {
			if (id >= 16 && id <= 28) {
				selectedCIs.push({
					id,
					text: condicionesNames[id - 16],
					type: 'Condición Subestándar'
				});
			}
		});

		return selectedCIs.sort((a, b) => a.id - b.id);
	};

	const handleSectionSelect = (section) => {
		setActiveSection(section);
	};

	const handleItemClick = (itemId) => {
		setActiveModal(itemId);
		const currentSection = activeSection;
		const currentData = causasBasicasData[currentSection];
		setModalSelectedItems(currentData.detailedSelections[itemId] || []);
	};

	const handleModalItemToggle = (optionIndex) => {
		setModalSelectedItems((prev) => {
			if (prev.includes(optionIndex)) {
				return prev.filter((index) => index !== optionIndex);
			} else {
				return [...prev, optionIndex];
			}
		});
	};

	const handleModalConfirm = () => {
		const currentSection = activeSection;
		const currentData = causasBasicasData[currentSection];
		
		if (modalSelectedItems.length > 0) {
			// Agregar el item a selectedItems si no está
			const newSelectedItems = currentData.selectedItems.includes(activeModal)
				? currentData.selectedItems
				: [...currentData.selectedItems, activeModal];
			
			// Guardar las selecciones detalladas
			const newDetailedSelections = {
				...currentData.detailedSelections,
				[activeModal]: modalSelectedItems
			};

			setCausasBasicasData(currentSection, {
				...currentData,
				selectedItems: newSelectedItems,
				detailedSelections: newDetailedSelections
			});
		} else {
			// Si no hay selecciones, remover el item
			const newSelectedItems = currentData.selectedItems.filter(id => id !== activeModal);
			const newDetailedSelections = { ...currentData.detailedSelections };
			delete newDetailedSelections[activeModal];

			setCausasBasicasData(currentSection, {
				...currentData,
				selectedItems: newSelectedItems,
				detailedSelections: newDetailedSelections
			});
		}
		
		setActiveModal(null);
		setModalSelectedItems([]);
	};

	const handleModalCancel = () => {
		setActiveModal(null);
		setModalSelectedItems([]);
	};

	const clearAllSelections = () => {
		const currentSection = activeSection;
		setCausasBasicasData(currentSection, {
			selectedItems: [],
			detailedSelections: {},
			image: null,
			observation: ''
		});
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const currentSection = activeSection;
				const currentData = causasBasicasData[currentSection];
				
				setCausasBasicasData(currentSection, {
					...currentData,
					image: e.target.result
				});
			};
			reader.readAsDataURL(file);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current.click();
	};

	const removeImage = () => {
		const currentSection = activeSection;
		const currentData = causasBasicasData[currentSection];
		
		setCausasBasicasData(currentSection, {
			...currentData,
			image: null
		});
		fileInputRef.current.value = "";
	};

	const handleObservationChange = (e) => {
		const currentSection = activeSection;
		const currentData = causasBasicasData[currentSection];
		
		setCausasBasicasData(currentSection, {
			...currentData,
			observation: e.target.value
		});
	};

	const getCurrentItems = () => {
		const baseItems = activeSection === 'personales' ? factoresPersonales : factoresLaborales;
		return getFilteredItems(baseItems);
	};

	const getAllItems = () => {
		return activeSection === 'personales' ? factoresPersonales : factoresLaborales;
	};

	const getSectionTitle = () => {
		return activeSection === 'personales' ? 'FACTORES PERSONALES' : 'FACTORES LABORALES';
	};

	const getSectionSubtitle = () => {
		return activeSection === 'personales' 
			? 'FACTORES RELACIONADOS CON LA PERSONA'
			: 'FACTORES RELACIONADOS CON EL TRABAJO';
	};

	const getModalItem = () => {
		const items = getAllItems();
		return items.find(item => item.id === activeModal);
	};

	const getCurrentSectionData = () => {
		return causasBasicasData[activeSection] || { 
			selectedItems: [], 
			detailedSelections: {},
			image: null, 
			observation: '' 
		};
	};

	const isFiltered = () => {
		const allSelectedCIs = [
			...causasInmediatasData.actos.selectedItems,
			...causasInmediatasData.condiciones.selectedItems
		];
		return !showAllItems && allSelectedCIs.length > 0;
	};

	if (!activeSection) {
		const selectedCausasInmediatas = getSelectedCausasInmediatas();
		const relevantCBs = getRelevantCBs();
		const filteredPersonales = getFilteredItems(factoresPersonales);
		const filteredLaborales = getFilteredItems(factoresLaborales);

		return (
			<div className={styles.contentCard}>
				<div className={styles.contentHeader}>
					<h2 className={styles.contentTitle}>CAUSAS BÁSICAS / SUBYACENTES</h2>
					<p className={styles.contentSubtitle}>
						Técnica de Análisis Sistemático de las Causas
					</p>
				</div>

				{selectedCausasInmediatas.length > 0 && (
					<div className={styles.filterInfo}>
						<div className={styles.filterHeader}>
							<h4>🔍 Filtrado basado en causas inmediatas seleccionadas:</h4>
							<button 
								className={styles.toggleFilterButton}
								onClick={() => setShowAllItems(!showAllItems)}
							>
								{showAllItems ? 'Mostrar Solo Relevantes' : 'Mostrar Todos los Items'}
							</button>
						</div>
						<div className={styles.selectedCIList}>
							{selectedCausasInmediatas.map(ci => (
								<span key={ci.id} className={`${styles.ciTag} ${ci.type === 'Acto Subestándar' ? styles.actoTag : styles.condicionTag}`}>
									{ci.id}. {ci.text.length > 50 ? ci.text.substring(0, 50) + '...' : ci.text}
								</span>
							))}
						</div>
						{!showAllItems && (
							<p className={styles.filterDescription}>
								Mostrando {relevantCBs.length} elementos relevantes de {factoresPersonales.length + factoresLaborales.length} totales
							</p>
						)}
					</div>
				)}

				<div className={styles.contentBody}>
					<p className={styles.description}>
						Seleccione el tipo de causa básica que desea analizar:
					</p>

					<div className={styles.sectionSelector}>
						<button
							className={`${styles.sectionCard} ${
								causasBasicasData.personales.selectedItems.length > 0 ? styles.hasData : ''
							}`}
							onClick={() => handleSectionSelect('personales')}
						>
							<div className={styles.sectionNumber}>1</div>
							<div className={styles.sectionContent}>
								<h3 className={styles.sectionTitle}>FACTORES PERSONALES</h3>
								<p className={styles.sectionDescription}>
									Factores relacionados con la persona
								</p>
								<p className={styles.sectionRange}>
									{isFiltered() && !showAllItems 
										? `${filteredPersonales.length} elementos relevantes (de 7 totales)`
										: 'Opciones 1-7'
									}
								</p>
								{causasBasicasData.personales.selectedItems.length > 0 && (
									<p className={styles.dataIndicator}>
										{causasBasicasData.personales.selectedItems.length} factor(es) seleccionado(s)
									</p>
								)}
							</div>
						</button>

						<button
							className={`${styles.sectionCard} ${
								causasBasicasData.laborales.selectedItems.length > 0 ? styles.hasData : ''
							}`}
							onClick={() => handleSectionSelect('laborales')}
						>
							<div className={styles.sectionNumber}>2</div>
							<div className={styles.sectionContent}>
								<h3 className={styles.sectionTitle}>FACTORES LABORALES</h3>
								<p className={styles.sectionDescription}>
									Factores relacionados con el trabajo
								</p>
								<p className={styles.sectionRange}>
									{isFiltered() && !showAllItems 
										? `${filteredLaborales.length} elementos relevantes (de 8 totales)`
										: 'Opciones 8-15'
									}
								</p>
								{causasBasicasData.laborales.selectedItems.length > 0 && (
									<p className={styles.dataIndicator}>
										{causasBasicasData.laborales.selectedItems.length} factor(es) seleccionado(s)
									</p>
								)}
							</div>
						</button>
					</div>
				</div>
			</div>
		);
	}

	const currentSectionData = getCurrentSectionData();
	const currentItems = getCurrentItems();
	const allItems = getAllItems();
	const selectedCausasInmediatas = getSelectedCausasInmediatas();

	return (
		<div className={styles.contentCard}>
			<div className={styles.contentHeader}>
				<button 
					className={styles.backButton}
					onClick={() => setActiveSection(null)}
				>
					← Volver
				</button>
				<h2 className={styles.contentTitle}>{getSectionTitle()}</h2>
				<p className={styles.contentSubtitle}>{getSectionSubtitle()}</p>
			</div>

			{selectedCausasInmediatas.length > 0 && (
				<div className={styles.filterInfo}>
					<div className={styles.filterHeader}>
						<h4>🔍 Filtrado por causas inmediatas:</h4>
						<button 
							className={styles.toggleFilterButton}
							onClick={() => setShowAllItems(!showAllItems)}
						>
							{showAllItems ? 'Mostrar Solo Relevantes' : 'Mostrar Todos los Items'}
						</button>
					</div>
					<div className={styles.selectedCIList}>
						{selectedCausasInmediatas.map(ci => (
							<span key={ci.id} className={`${styles.ciTag} ${ci.type === 'Acto Subestándar' ? styles.actoTag : styles.condicionTag}`}>
								{ci.id}. {ci.text.length > 40 ? ci.text.substring(0, 40) + '...' : ci.text}
							</span>
						))}
					</div>
					{!showAllItems && (
						<p className={styles.filterDescription}>
							Mostrando {currentItems.length} de {allItems.length} elementos
						</p>
					)}
				</div>
			)}

			<div className={styles.detailView}>
				<div className={styles.header}>
					<h3>Seleccionar Elementos</h3>
					<button
						className={styles.clearButton}
						onClick={clearAllSelections}
						disabled={currentSectionData.selectedItems.length === 0}
					>
						Limpiar Selección
					</button>
				</div>

				<div className={styles.contentWrapper}>
					<div className={styles.itemsGridContainer}>
						<div className={styles.itemsGrid}>
							{currentItems.map((item) => (
								<button
									key={item.id}
									className={`${styles.itemCard} ${
										currentSectionData.selectedItems.includes(item.id) ? styles.selected : ""
									}`}
									onClick={() => handleItemClick(item.id)}
								>
									<div className={styles.itemNumber}>{item.id}</div>
									<div className={styles.itemContent}>
										<div className={styles.itemText}>{item.text}</div>
									</div>
								</button>
							))}
						</div>

						{currentSectionData.selectedItems.length > 0 && (
							<div className={styles.selectedSummary}>
								<h4>Elementos Seleccionados ({currentSectionData.selectedItems.length}):</h4>
								<div className={styles.selectedList}>
									{currentSectionData.selectedItems.map((id) => {
										const item = allItems.find((item) => item.id === id);
										const detailCount = currentSectionData.detailedSelections[id]?.length || 0;
										return (
											<span key={id} className={styles.selectedTag}>
												{id}. {item.text} {detailCount > 0 && `(${detailCount} detalles)`}
											</span>
										);
									})}
								</div>
							</div>
						)}
					</div>

					<div className={styles.rightPanel}>
						<div className={styles.imageSection}>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleImageUpload}
								accept="image/*"
								className={styles.fileInput}
							/>

							{currentSectionData.image ? (
								<div className={styles.imagePreviewContainer}>
									<img
										src={currentSectionData.image || "/placeholder.svg"}
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
										<div className={styles.magnifyingGlass}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<circle cx="11" cy="11" r="8"></circle>
												<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
											</svg>
										</div>
									</div>
									<p>Haga clic para agregar imagen</p>
								</div>
							)}
						</div>

						<div className={styles.observationSection}>
							<div className={styles.observationHeader}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className={styles.editIcon}
								>
									<path d="M12 20h9"></path>
									<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
								</svg>
								<span>Observación</span>
							</div>
							<textarea
								className={styles.observationTextarea}
								value={currentSectionData.observation || ''}
								onChange={handleObservationChange}
								placeholder="Escriba sus observaciones aquí..."
								rows={6}
							></textarea>
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
								{getModalItem()?.id}. {getModalItem()?.text}
							</h3>
							<button 
								className={styles.modalCloseBtn}
								onClick={handleModalCancel}
							>
								×
							</button>
						</div>
						
						<div className={styles.modalBody}>
							<p className={styles.modalDescription}>
								Seleccione las opciones específicas que aplican:
							</p>
							
							<div className={styles.modalOptions}>
								{getModalItem()?.options.map((option, index) => (
									<button
										key={index}
										className={`${styles.modalOption} ${
											modalSelectedItems.includes(index) ? styles.modalOptionSelected : ""
										}`}
										onClick={() => handleModalItemToggle(index)}
									>
										<div className={styles.modalOptionIcon}>
											{modalSelectedItems.includes(index) ? "✓" : "○"}
										</div>
										<span className={styles.modalOptionText}>{option}</span>
									</button>
								))}
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
								Confirmar ({modalSelectedItems.length})
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default CausasBasicasContent;

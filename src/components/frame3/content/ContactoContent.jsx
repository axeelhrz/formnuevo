"use client";

import { useRef, useEffect } from "react";
import styles from "./ContactoContent.module.css";
import { useScatData } from "../../../contexts/ScatContext";

function ContactoContent() {
	const { contactoData, setContactoData } = useScatData();
	const fileInputRef = useRef(null);

	// Debug: Mostrar datos cargados
	useEffect(() => {
		console.log('=== CONTACTO CONTENT - DATOS CARGADOS ===');
		console.log('contactoData:', contactoData);
	}, [contactoData]);

	const incidents = [
		{
			id: 1,
			title: "Golpeada Contra (chocar contra algo)",
			subtitle: "(Ver CI 1,2,4,5,12,14,15,16,17,18,19,26)",
			ci: [1, 2, 4, 5, 12, 14, 15, 16, 17, 18, 19, 26],
		},
		{
			id: 2,
			title: "Golpeado por (Impactado por objeto en movimiento)",
			subtitle: "(Ver CI 1,2,4,5,6,12,14,15,16,20,26)",
			ci: [1, 2, 4, 5, 6, 12, 14, 15, 16, 20, 26],
		},
		{
			id: 3,
			title: "Caída a un nivel más bajo",
			subtitle: "(Ver CI 3,5,6,7,11,12,13,14,15,16,17,22)",
			ci: [3, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 22],
		},
		{
			id: 4,
			title: "Caída en el mismo nivel (Resbalar y caer, tropezar)",
			subtitle: "(Ver CI 4,8,13,14,15,16,19,22,26)",
			ci: [4, 8, 13, 14, 15, 16, 19, 22, 26],
		},
		{
			id: 5,
			title: "Atrapado (Puntos de Pellizco y Mordida)",
			subtitle: "(Ver CI 5,6,11,13,14,15,16,18)",
			ci: [5, 6, 11, 13, 14, 15, 16, 18],
		},
		{
			id: 6,
			title: "Cogido (Enganchado, Colgado)",
			subtitle: "(Ver CI 5,6,11,12,13,14,15,16,18)",
			ci: [5, 6, 11, 12, 13, 14, 15, 16, 18],
		},
		{
			id: 7,
			title: "Atrapado entre o debajo (Chancado, Amputado)",
			subtitle: "(Ver CI 6,7,9,11,12,13,14,15,16,22,28)",
			ci: [6, 7, 9, 11, 12, 13, 14, 15, 16, 22, 28],
		},
		{
			id: 8,
			title:
				"Contacto con (Electricidad, Calor, Frío, Radiación, Causticos, Tóxicos, Ruido)",
			subtitle: "(Ver CI 8,6,7,11,12,13,14,15,16,17,18,20,21,23,24,25,27,28)",
			ci: [8, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 23, 24, 25, 27, 28],
		},
		{
			id: 9,
			title: "Golpeado por (Impactado por objeto en movimiento)",
			subtitle: "(Ver CI 1,2,4,5,6,8,10,12,13,14,15,16,20,26)",
			ci: [1, 2, 4, 5, 6, 8, 10, 12, 13, 14, 15, 16, 20, 26],
		},
	];

	const handleIncidentToggle = (incidentId) => {
		const newSelectedIncidents = contactoData.selectedIncidents.includes(incidentId)
			? contactoData.selectedIncidents.filter((id) => id !== incidentId)
			: [...contactoData.selectedIncidents, incidentId];

		console.log('=== ACTUALIZANDO SELECCIÓN DE INCIDENTES ===');
		console.log('Incidente seleccionado:', incidentId);
		console.log('Nuevas selecciones:', newSelectedIncidents);

		setContactoData({
			...contactoData,
			selectedIncidents: newSelectedIncidents
		});
	};

	const clearAllSelections = () => {
		setContactoData({
			...contactoData,
			selectedIncidents: []
		});
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setContactoData({
					...contactoData,
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
		setContactoData({
			...contactoData,
			image: null
		});
		fileInputRef.current.value = "";
	};

	const handleObservationChange = (e) => {
		setContactoData({
			...contactoData,
			observation: e.target.value
		});
	};

	return (
		<div className={styles.incidentSelector}>
			<div className={styles.header}>
				<h3>Seleccionar Tipos de Incidentes</h3>
				<button
					className={styles.clearButton}
					onClick={clearAllSelections}
					disabled={contactoData.selectedIncidents.length === 0}
				>
					Limpiar Selección
				</button>
			</div>

			<div className={styles.contentWrapper}>
				<div className={styles.incidentGridContainer}>
					<div className={styles.incidentGrid}>
						{incidents.map((incident) => {
							const isSelected = contactoData.selectedIncidents.includes(incident.id);
							console.log(`Incidente ${incident.id} seleccionado:`, isSelected);
							
							return (
								<button
									key={incident.id}
									className={`${styles.incidentItem} ${
										isSelected ? styles.selected : ""
									}`}
									onClick={() => handleIncidentToggle(incident.id)}
								>
									<div className={styles.incidentNumber}>{incident.id}</div>
									<div className={styles.incidentContent}>
										<div className={styles.incidentTitle}>{incident.title}</div>
										<div className={styles.incidentSubtitle}>
											{incident.subtitle}
										</div>
									</div>
								</button>
							);
						})}
					</div>

					{contactoData.selectedIncidents.length > 0 && (
						<div className={styles.selectedSummary}>
							<h4>Incidentes Seleccionados ({contactoData.selectedIncidents.length}):</h4>
							<div className={styles.selectedList}>
								{contactoData.selectedIncidents.map((id) => {
									const incident = incidents.find((inc) => inc.id === id);
									return (
										<span key={id} className={styles.selectedTag}>
											{id}. {incident.title.split("(")[0].trim()}
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

						{contactoData.image ? (
							<div className={styles.imagePreviewContainer}>
								<img
									src={contactoData.image || "/placeholder.svg"}
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
							value={contactoData.observation || ''}
							onChange={handleObservationChange}
							placeholder="Escriba sus observaciones aquí..."
							rows={6}
						></textarea>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ContactoContent;
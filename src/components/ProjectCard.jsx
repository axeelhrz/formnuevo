import { Edit, FileDown, Trash2 } from "lucide-react";
import styles from "./ProjectCard.module.css";
import pdfService from "../services/pdfService";

export default function ProjectCard({ project, isHighlighted = false, onDelete, onEdit }) {
	const handleDelete = (e) => {
		e.stopPropagation();
		if (onDelete) {
			const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`);
			if (confirmed) {
				onDelete();
			}
		}
	};

	const handleDownloadPDF = (e) => {
		e.stopPropagation();
		
		try {
			// Crear datos de SCAT con la información disponible del proyecto
			const scatData = {
				project: project.formData || {
					evento: project.name || 'Sin título',
					involucrado: project.description || 'Sin descripción',
					area: 'No especificada',
					fechaHora: project.createdAt || new Date().toISOString(),
					investigador: 'No especificado',
					otrosDatos: ''
				},
				evaluacion: project.scatData?.evaluacion || {
					severity: null,
					probability: null,
					frequency: null
				},
				contacto: project.scatData?.contacto || {
					selectedIncidents: [],
					image: null,
					observation: ''
				},
				causasInmediatas: project.scatData?.causasInmediatas || {
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
				causasBasicas: project.scatData?.causasBasicas || {
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
				necesidadesControl: project.scatData?.necesidadesControl || {
					selectedItems: [],
					detailedData: {},
					globalImage: null,
					globalObservation: ''
				}
			};

			// Generar nombre de archivo basado en el proyecto
			const fileName = `reporte-scat-${project.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
			
			// Descargar PDF
			pdfService.downloadPDF(scatData, fileName);
			
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Error al generar el PDF. Por favor, intenta nuevamente.');
		}
	};

	const handleEdit = (e) => {
		e.stopPropagation();
		if (onEdit) {
			onEdit(project);
		}
	};

	return (
		<div
			className={`${styles.card} ${isHighlighted ? styles.highlighted : ""}`}
		>
			<div className={styles.content}>
				<div className={styles.title}>PROYECTO</div>
				<div className={styles.subtitle}>CREADO</div>
				{project.name && (
					<div className={styles.projectName}>{project.name}</div>
				)}
				{project.createdAt && (
					<div className={styles.projectDate}>
						{new Date(project.createdAt).toLocaleDateString('es-ES')}
					</div>
				)}
				{project.version && project.version > 1 && (
					<div className={styles.versionBadge}>
						v{project.version}
					</div>
				)}
			</div>

			<div className={styles.actions}>
				<button 
					className={styles.actionButton} 
					onClick={handleEdit}
					title="Editar proyecto completo (todas las pestañas)"
				>
					<Edit size={14} />
				</button>
				<button 
					className={styles.actionButton} 
					onClick={handleDownloadPDF}
					title="Descargar reporte PDF completo"
				>
					<FileDown size={14} />
				</button>
				<button 
					className={`${styles.actionButton} ${styles.deleteButton}`} 
					onClick={handleDelete}
					title="Eliminar proyecto"
				>
					<Trash2 size={14} />
				</button>
			</div>
		</div>
	);
}
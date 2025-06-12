"use client";

import { useState } from "react";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import styles from "./TrashModal.module.css";

function TrashModal({ isOpen, onClose, deletedProjects, onRestoreProject, onPermanentDelete, onEmptyTrash }) {
	const [selectedProjects, setSelectedProjects] = useState(new Set());

	if (!isOpen) return null;

	const handleSelectProject = (projectId) => {
		const newSelected = new Set(selectedProjects);
		if (newSelected.has(projectId)) {
			newSelected.delete(projectId);
		} else {
			newSelected.add(projectId);
		}
		setSelectedProjects(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedProjects.size === deletedProjects.length) {
			setSelectedProjects(new Set());
		} else {
			setSelectedProjects(new Set(deletedProjects.map(p => p.id)));
		}
	};

	const handleRestoreSelected = () => {
		if (selectedProjects.size > 0) {
			const confirmed = window.confirm(`¿Estás seguro de que quieres restaurar ${selectedProjects.size} proyecto(s)?`);
			if (confirmed) {
				selectedProjects.forEach(projectId => {
					const project = deletedProjects.find(p => p.id === projectId);
					if (project) {
						onRestoreProject(project);
					}
				});
				setSelectedProjects(new Set());
			}
		}
	};

	const handleDeleteSelected = () => {
		if (selectedProjects.size > 0) {
			const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar permanentemente ${selectedProjects.size} proyecto(s)? Esta acción no se puede deshacer.`);
			if (confirmed) {
				selectedProjects.forEach(projectId => {
					onPermanentDelete(projectId);
				});
				setSelectedProjects(new Set());
			}
		}
	};

	const handleEmptyTrash = () => {
		if (deletedProjects.length > 0) {
			const confirmed = window.confirm(`¿Estás seguro de que quieres vaciar la papelera? Se eliminarán permanentemente ${deletedProjects.length} proyecto(s). Esta acción no se puede deshacer.`);
			if (confirmed) {
				onEmptyTrash();
				setSelectedProjects(new Set());
			}
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<div className={styles.headerLeft}>
						<Trash2 className={styles.titleIcon} size={24} />
						<h2 className={styles.title}>Papelera de Proyectos</h2>
						<span className={styles.count}>({deletedProjects.length})</span>
					</div>
					<button className={styles.closeButton} onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{deletedProjects.length === 0 ? (
					<div className={styles.emptyState}>
						<Trash2 size={48} className={styles.emptyIcon} />
						<h3 className={styles.emptyTitle}>La papelera está vacía</h3>
						<p className={styles.emptyDescription}>
							Los proyectos eliminados aparecerán aquí
						</p>
					</div>
				) : (
					<>
						<div className={styles.actions}>
							<div className={styles.selectionActions}>
								<button 
									className={styles.selectAllButton}
									onClick={handleSelectAll}
								>
									{selectedProjects.size === deletedProjects.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
								</button>
								{selectedProjects.size > 0 && (
									<span className={styles.selectedCount}>
										{selectedProjects.size} seleccionado(s)
									</span>
								)}
							</div>
							<div className={styles.bulkActions}>
								<button 
									className={styles.restoreButton}
									onClick={handleRestoreSelected}
									disabled={selectedProjects.size === 0}
								>
									<RotateCcw size={16} />
									Restaurar
								</button>
								<button 
									className={styles.deleteButton}
									onClick={handleDeleteSelected}
									disabled={selectedProjects.size === 0}
								>
									<Trash2 size={16} />
									Eliminar
								</button>
								<button 
									className={styles.emptyTrashButton}
									onClick={handleEmptyTrash}
								>
									<AlertTriangle size={16} />
									Vaciar papelera
								</button>
							</div>
						</div>

						<div className={styles.projectsList}>
							{deletedProjects.map((project) => (
								<div 
									key={project.id} 
									className={`${styles.projectItem} ${selectedProjects.has(project.id) ? styles.selected : ''}`}
								>
									<div className={styles.projectHeader}>
										<input
											type="checkbox"
											checked={selectedProjects.has(project.id)}
											onChange={() => handleSelectProject(project.id)}
											className={styles.checkbox}
										/>
										<div className={styles.projectInfo}>
											<h4 className={styles.projectName}>{project.name}</h4>
											<p className={styles.projectDescription}>{project.description}</p>
											<span className={styles.deletedDate}>
												Eliminado: {formatDate(project.deletedAt)}
											</span>
										</div>
									</div>
									<div className={styles.projectActions}>
										<button 
											className={styles.actionButton}
											onClick={() => onRestoreProject(project)}
											title="Restaurar proyecto"
										>
											<RotateCcw size={16} />
										</button>
										<button 
											className={styles.actionButton}
											onClick={() => onPermanentDelete(project.id)}
											title="Eliminar permanentemente"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default TrashModal;

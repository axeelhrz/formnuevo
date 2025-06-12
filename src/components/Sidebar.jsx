"use client";

import { Home, TrendingUp, Layers, FileText, X } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onToggle, onNavigateToProjects }) {
	const handleLayersClick = () => {
		console.log("Layers button clicked");
		if (onNavigateToProjects) {
			onNavigateToProjects();
		}
		// Cerrar el sidebar en móvil después de navegar
		if (onToggle) {
			onToggle();
		}
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && <div className={styles.overlay} onClick={onToggle} />}

			{/* Sidebar */}
			<div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
				{/* Mobile close button */}
				<button onClick={onToggle} className={styles.closeButton}>
					<X size={20} />
				</button>

				<div className={styles.logo}>SCAT</div>

				<nav className={styles.nav}>
					<button className={styles.navButton} title="Inicio">
						<Home size={20} />
					</button>
					<button className={styles.navButton} title="Tendencias">
						<TrendingUp size={20} />
					</button>
					<button 
						className={styles.navButton} 
						onClick={handleLayersClick}
						title="Proyectos"
					>
						<Layers size={20} />
					</button>
					<button className={styles.navButton} title="Documentos">
						<FileText size={20} />
					</button>
				</nav>
			</div>
		</>
	);
}
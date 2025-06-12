"use client";

import { Trash2, Archive, Info, Menu } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({ onMenuToggle }) {
	return (
		<div className={styles.header}>
			{/* Mobile menu button */}
			<button onClick={onMenuToggle} className={styles.menuButton}>
				<Menu size={20} />
			</button>

			<h1 className={styles.title}>
				<span className={styles.titleFull}>
					Técnica de Análisis Sistemático de las Causas
				</span>
				<span className={styles.titleShort}>SCAT</span>
			</h1>

			<div className={styles.actions}>
				<button className={styles.actionButton}>
					<Trash2 size={16} />
				</button>
				<button className={styles.actionButton}>
					<Archive size={16} />
				</button>
				<button className={styles.actionButton}>
					<Info size={16} />
				</button>
			</div>
		</div>
	);
}

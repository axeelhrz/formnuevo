import styles from "./EvaluacionContent.module.css";
import { useScatData } from "../../../contexts/ScatContext";

function EvaluacionContent() {
	const { evaluacionData, setEvaluacionData } = useScatData();

	const handleSelection = (category, value) => {
		const newData = {
			...evaluacionData,
			[category]: evaluacionData[category] === value ? null : value,
		};
		setEvaluacionData(newData);
	};

	return (
		<div className={styles.riskAssessment}>
			<div className={styles.riskCategory}>
				<div className={styles.categoryLabel}>
					<span>Potencial de Severidad de Pérdida</span>
				</div>
				<div className={styles.optionsContainer}>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.severity === "A" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("severity", "A")}
					>
						<span className={styles.letter}>A</span>
						<span className={`${styles.value} ${styles.mayor}`}>Mayor</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.severity === "B" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("severity", "B")}
					>
						<span className={styles.letter}>B</span>
						<span className={`${styles.value} ${styles.grave}`}>Grave</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.severity === "C" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("severity", "C")}
					>
						<span className={styles.letter}>C</span>
						<span className={`${styles.value} ${styles.menor}`}>Menor</span>
					</button>
				</div>
			</div>

			<div className={styles.riskCategory}>
				<div className={styles.categoryLabel}>
					<span>Probabilidad de Ocurrencia</span>
				</div>
				<div className={styles.optionsContainer}>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.probability === "A" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("probability", "A")}
					>
						<span className={styles.letter}>A</span>
						<span className={`${styles.value} ${styles.alta}`}>Alta</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.probability === "B" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("probability", "B")}
					>
						<span className={styles.letter}>B</span>
						<span className={`${styles.value} ${styles.moderada}`}>
							Moderada
						</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.probability === "C" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("probability", "C")}
					>
						<span className={styles.letter}>C</span>
						<span className={`${styles.value} ${styles.rara}`}>Rara</span>
					</button>
				</div>
			</div>

			<div className={styles.riskCategory}>
				<div className={styles.categoryLabel}>
					<span>Frecuencia de Exposición</span>
				</div>
				<div className={styles.optionsContainer}>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.frequency === "A" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("frequency", "A")}
					>
						<span className={styles.letter}>A</span>
						<span className={`${styles.value} ${styles.grande}`}>Grande</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.frequency === "B" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("frequency", "B")}
					>
						<span className={styles.letter}>B</span>
						<span className={`${styles.value} ${styles.moderada}`}>
							Moderada
						</span>
					</button>
					<button
						className={`${styles.optionButton} ${
							evaluacionData.frequency === "C" ? styles.selected : ""
						}`}
						onClick={() => handleSelection("frequency", "C")}
					>
						<span className={styles.letter}>C</span>
						<span className={`${styles.value} ${styles.baja}`}>Baja</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default EvaluacionContent;
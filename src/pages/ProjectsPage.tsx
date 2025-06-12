"use client";

import { useState } from "react";
import ProjectsView from "../components/ProjectsView";
import ScatInterface from "../components/frame3/ScatInterface";
import "../index.css";

function ProjectsPage() {
	const [currentView, setCurrentView] = useState("projects");
	const [formData, setFormData] = useState(null);

	const handleNavigateToScat = (data) => {
		console.log("Navigating to SCAT with data:", data);
		setFormData(data);
		setCurrentView("scat");
	};

	const handleNavigateToProjects = () => {
		console.log("Navigating back to projects");
		setCurrentView("projects");
	};

	const handleNavigateToBase = () => {
		console.log("Navigating to base - staying in projects for this page");
		setCurrentView("projects");
	};

	const handleNavigateToHome = () => {
		console.log("Navigating to home - staying in projects for this page");
		setFormData(null);
		setCurrentView("projects");
		localStorage.removeItem('scatProgress');
	};

	const handleNavigateToDescription = () => {
		console.log("Navigating to description - staying in projects for this page");
		setCurrentView("projects");
	};

	return (
		<div style={{ height: "100vh", width: "100vw" }}>
			{currentView === "projects" && (
				<ProjectsView 
					onNavigateToScat={handleNavigateToScat}
					onNavigateToBase={handleNavigateToProjects}
				/>
			)}
			{currentView === "scat" && (
				<ScatInterface 
					onNavigateToBase={handleNavigateToProjects}
					onNavigateToProjects={handleNavigateToProjects}
					onNavigateToDescription={handleNavigateToDescription}
					formData={formData}
				/>
			)}
		</div>
	);
}

export default ProjectsPage;

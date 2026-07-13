import React from "react";
import ProjectDetails from "../../components/ProjectDetails";

const ProjectPage = ({ params }) => {
  const project = params.project_id;

  if (!project) return <p>Loading...</p>;

  return (
    <div className="overflow-hidden relative z-10">
      <ProjectDetails project_id={project} />
    </div>
  );
};

export default ProjectPage;

// Static generation of dynamic routes

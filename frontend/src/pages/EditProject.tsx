import { Container, Title } from "@mantine/core";
import { handleAppEvents, useAppSelector } from "../store";
import { ProjectForm } from "../components";
import type { Project } from "../api/Api";
import { getApi } from "../api";
import { useNavigate } from "react-router-dom";
import { crewsArrayFromObjectMap } from "../store/crews";

export default function EditProject() {
  const project = useAppSelector((state) => state.project);
  const crews = useAppSelector((state) => crewsArrayFromObjectMap(state.crews));
  const navigate = useNavigate();

  if (!project) return <Container>Error: Project not found</Container>;

  const onSubmit = (values: Project) => {
    getApi()
      .api.updateProject(values)
      .then((response) => {
        if (response.status === 200) {
          handleAppEvents(response.data);
          navigate("/");
        } else {
          console.error("Failed to update project:", response);
        }
      })
      .catch((error) => {
        console.error("Error updating project:", error);
      });
  };

  return (
    <Container>
      <Title order={1}>Edit Project</Title>
      <Title order={2} size="h4" mb="lg">
        {project.name}
      </Title>
      <ProjectForm project={project} crews={crews} onSubmit={onSubmit} />
    </Container>
  );
}

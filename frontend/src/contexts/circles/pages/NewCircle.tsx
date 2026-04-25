import { Stack, Title } from "@mantine/core";
import CircleForm from "../components/CircleForm";
import { getApi } from "../../../api";
import type { Circle } from "../../../api/Api";
import { handleAppEvents } from "../../../store";
import { useNavigate } from "react-router-dom";

export default function NewCircle() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Circle): Promise<void> => {
    return getApi()
      .api.createCircle(data)
      .then((response) => {
        handleAppEvents(response.data);
        navigate("/circles");
      })
      .catch((error) => {
        console.error("Error creating event template:", error);
      });
  };

  return (
    <Stack>
      <Title order={1}>New Circle</Title>

      <CircleForm onSubmit={handleSubmit} />
    </Stack>
  );
}

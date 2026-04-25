import { Container, Stack, Title } from "@mantine/core";
import CircleForm from "../components/CircleForm";
import { getApi } from "../../../api";
import type { Circle } from "../../../api/Api";
import { handleAppEvents, useAppSelector } from "../../../store";
import { useNavigate, useParams } from "react-router-dom";
import { actionFailure, type ActionPromiseResult } from "../../../components/ActionResult";

export default function EditCircle() {
  const { circleSlug } = useParams<"circleSlug">();
  const circle = useAppSelector((state) => state.circles?.find((c) => c.slug === circleSlug));
  const navigate = useNavigate();

  if (!circleSlug || !circle) {
    return (
      <Container>
        <Title order={2}>Circle not found</Title>
        <p>The circle you are trying to edit does not exist.</p>
      </Container>
    );
  }

  const handleSubmit = async (data: Circle): Promise<ActionPromiseResult> => {
    return getApi()
      .api.updateCircle(data.id.toString(), data)
      .then((response) => {
        handleAppEvents(response.data);
        navigate("..");
      })
      .catch((error) => {
        return actionFailure(error);
      });
  };

  return (
    <Stack>
      <Title order={1}>Edit Circle</Title>

      <CircleForm onSubmit={handleSubmit} value={circle} />
    </Stack>
  );
}

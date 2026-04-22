import { Stack, Title } from "@mantine/core";
import CircleForm from "../components/CircleForm";

export default function NewCircle() {
  const handleSubmit = async (data: any): Promise<void> => {};

  return (
    <Stack>
      <Title order={1}>New Circle</Title>

      <CircleForm onSubmit={handleSubmit} />
    </Stack>
  );
}

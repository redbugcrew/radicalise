import { Card, Stack } from "@mantine/core";

export default function NoData({ children }: { children: React.ReactNode }) {
  return (
    <Stack justify="center" align="center">
      <Card maw={400} miw={300} ta="center" c="dimmed">
        {children}
      </Card>
    </Stack>
  );
}

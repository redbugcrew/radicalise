import { Card, Stack, Title } from "@mantine/core"

interface NoDataProps {
  title: string
  children: React.ReactNode
}

export default function NoData({ title, children }: NoDataProps) {
  return (
    <Stack justify="center" align="center">
      <Card maw={400} miw={300} ta="center" c="dimmed">
        {title && (
          <Title order={3} mt={0} mb="md">
            {title}
          </Title>
        )}
        {children}
      </Card>
    </Stack>
  )
}

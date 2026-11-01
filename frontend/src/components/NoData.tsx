import { Card, Stack } from "@mantine/core"

interface NoDataProps {
  title: string
  children: React.ReactNode
}

export default function NoData({ title, children }: NoDataProps) {
  return (
    <Stack justify="center" align="center">
      <Card maw={400} miw={300} ta="center" c="dimmed">
        <h3>{title}</h3>
        {children}
      </Card>
    </Stack>
  )
}

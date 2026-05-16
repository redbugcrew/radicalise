import { Container, Paper, Title, Text } from "@mantine/core";
import classes from "../Auth.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" fz="sm" ta="center">
          {description}
        </Text>
      )}

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        {children}
      </Paper>
    </Container>
  );
}

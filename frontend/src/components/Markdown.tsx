import ReactMarkdown from "react-markdown";
import { Stack, Text } from "@mantine/core";
import Anchor from "./Anchor";

export default function Markdown({ children }: { children: string | null | undefined }) {
  if (!children) return null;

  return (
    <Stack gap="md">
      <ReactMarkdown
        components={{
          p: ({ children }) => <Text>{children}</Text>,
          a: ({ children, href }) => <Anchor href={href}>{children}</Anchor>,
        }}
      >
        {children}
      </ReactMarkdown>
    </Stack>
  );
}

import { Link } from "react-router-dom";
import { Anchor as MantineAnchor, type AnchorProps as MantineAnchorProps, Text } from "@mantine/core";

export type AnchorProps = MantineAnchorProps & {
  href: string | undefined;
  children: React.ReactNode;
  target?: string;
};

export default function Anchor({ href, children, ...otherProps }: AnchorProps) {
  if (!href) {
    return <Text>{children}</Text>; // Fallback for undefined href
  }
  return (
    <MantineAnchor component={Link} to={href} {...otherProps}>
      {children}
    </MantineAnchor>
  );
}

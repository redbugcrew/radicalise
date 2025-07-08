import { Link } from "react-router-dom";
import { Anchor as MantineAnchor, type AnchorProps as MantineAnchorProps } from "@mantine/core";

export type AnchorProps = MantineAnchorProps & {
  href: string;
  children: React.ReactNode;
  target?: string;
};

export default function Anchor({ href, children, ...otherProps }: AnchorProps) {
  return (
    <MantineAnchor component={Link} to={href} {...otherProps}>
      {children}
    </MantineAnchor>
  );
}

import { Link } from "react-router-dom";

export type AnchorProps = {
  href: string;
  children: React.ReactNode;
};

export default function Anchor({ href, children }: AnchorProps) {
  return <Link to={href}>{children}</Link>;
}

import { NavLink as MantineNavLink, type NavLinkProps as MantineNavLinkProps } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export type NavLinkProps = MantineNavLinkProps & {
  href: string;
};

export default function NavLink({ href, ...innerProps }: NavLinkProps) {
  let navigate = useNavigate();

  return <MantineNavLink {...innerProps} onClick={() => navigate(href) && false} />;
}

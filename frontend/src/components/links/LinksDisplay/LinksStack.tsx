import { Stack } from "@mantine/core";
import type { LinkWithType } from "../LinksInput/LinkInput";
import LinkDisplay from "./LinkDisplay";
import type { Link } from "../../../api/Api";

export default function LinksStack({ links }: { links: LinkWithType[] | Link[] | undefined | null }) {
  if (!links || links.length === 0) return null;

  return (
    <Stack gap="xs">
      {links.map((link, index) => (
        <LinkDisplay key={index} link={link} />
      ))}
    </Stack>
  );
}

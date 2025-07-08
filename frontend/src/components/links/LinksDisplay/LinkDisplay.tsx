import { Flex } from "@mantine/core";
import type { LinkWithType } from "../LinksInput/LinkInput";
import { IconCircleLetterL, IconBrandMatrix, IconWorldWww, IconLayoutKanban } from "@tabler/icons-react";
import Anchor from "../../Anchor";

const iconProps = {
  size: 16,
};

export type LinkType = "Loomio" | "Matrix" | "Taiga" | "Website";

const typeIcons: Record<LinkType, React.ReactNode> = {
  Loomio: <IconCircleLetterL {...iconProps} color="var(--mantine-color-yellow-5)" />,
  Matrix: <IconBrandMatrix {...iconProps} color="white" />,
  Taiga: <IconLayoutKanban {...iconProps} color="var(--mantine-color-teal-5)" />,
  Website: <IconWorldWww {...iconProps} color="var(--mantine-color-blue-5)" />,
};

export const linkTypes: LinkType[] = Object.keys(typeIcons) as LinkType[];

export function stringToLinkType(input: string | undefined | null): LinkType | undefined {
  if (typeof input === "undefined" || input === null) return undefined;

  if (linkTypes.includes(input as LinkType)) {
    return input as LinkType;
  } else {
    console.log(`Unknown link type: ${input}`);
    return undefined;
  }
}

export function getLinkTypeIcon(linkType: LinkType): React.ReactNode {
  return typeIcons[linkType] || null;
}

export default function LinkDisplay({ link }: { link: LinkWithType }) {
  if (!link || !link.link_type || !link.url) return null;

  const icon = getLinkTypeIcon(link.link_type);
  const name = link.url;

  return (
    <Flex align="center" justify="flex-start" gap="sm">
      {icon}
      <Anchor href={link.url} target="_blank">
        {link.label || name}
      </Anchor>
    </Flex>
  );
}

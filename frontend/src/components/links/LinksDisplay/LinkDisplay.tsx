import { Flex } from "@mantine/core";
import type { LinkWithType } from "../LinksInput/LinkInput";
import { IconCircleLetterL, IconBrandMatrix, IconWorldWww } from "@tabler/icons-react";

const iconProps = {
  size: 16,
};

export type LinkType = "Loomio" | "Matrix" | "Website";

const typeIcons: Record<LinkType, React.ReactNode> = {
  Loomio: <IconCircleLetterL {...iconProps} color="var(--mantine-color-yellow-5)" />,
  Matrix: <IconBrandMatrix {...iconProps} color="white" />,
  Website: <IconWorldWww {...iconProps} color="var(--mantine-color-blue-5)" />,
};

export const linkTypes: LinkType[] = Object.keys(typeIcons) as LinkType[];

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
      <span>{name}</span>
    </Flex>
  );
}

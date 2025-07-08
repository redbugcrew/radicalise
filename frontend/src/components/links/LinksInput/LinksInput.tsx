import { ActionIcon, Flex, Group, Input, Stack, type InputWrapperProps } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import LinkInput, { defaultLink, linkIsBlank, linkValidator, type LinkWithType } from "./LinkInput";
import { useUncontrolled } from "@mantine/hooks";
import type { Link } from "../../../api/Api";
import { stringToLinkType } from "../LinksDisplay/LinkDisplay";

export type LinksWithType = LinkWithType[];

type LinksInputProps = InputWrapperProps & {
  value?: LinksWithType | undefined;
  defaultValue?: LinksWithType | undefined;
  onChange?: (value: LinksWithType) => void;
  placeholder?: string;
};

function ensureEmptyLink(links: LinksWithType | undefined): LinksWithType {
  if (!links || links.length === 0) {
    return [...(links || []), defaultLink()];
  }
  return links;
}

export function optionalLinksValidator(links: LinksWithType | undefined): string | null {
  if (!links || links.length === 0) return null;

  for (const link of links) {
    const result = linkValidator(link);
    if (result) return result;
  }

  return null;
}

export function linksValidator(links: Link[]): string | null {
  return optionalLinksValidator(
    links.map(
      (link) =>
        ({
          link_type: stringToLinkType(link.link_type),
          url: link.url,
          label: link.label,
        } as LinkWithType)
    )
  );
}

export default function LinksInput({ placeholder, value, defaultValue, onChange, ...wrapperProps }: LinksInputProps) {
  const [controlValue, setControlValue] = useUncontrolled<LinksWithType>({
    value: ensureEmptyLink(value),
    defaultValue: ensureEmptyLink(defaultValue),
    finalValue: undefined,
    onChange: onChange as any,
  });

  const lastLinkIsBlank: () => boolean = () => {
    return controlValue.length >= 1 && linkIsBlank(controlValue[controlValue.length - 1]);
  };

  const onlyLinkIsBlank: () => boolean = () => {
    return controlValue.length === 1 && linkIsBlank(controlValue[0]);
  };

  const onLinkChange = (index: number, newLink: LinkWithType) => {
    const updatedLinks = [...controlValue];
    updatedLinks[index] = newLink;
    setControlValue(updatedLinks);
  };

  const onRemoveLink = (index: number) => {
    setControlValue(controlValue.filter((_, i) => i !== index));
  };

  const onAddLink = () => {
    if (lastLinkIsBlank()) return;

    setControlValue([...controlValue, defaultLink()]);
  };

  return (
    <Input.Wrapper {...wrapperProps}>
      <Stack>
        {controlValue.map((link, index) => (
          <Flex key={index} gap="sm" justify="space-between" align="flex-start">
            <LinkInput key={index} value={link} placeholder={placeholder} defaultValue={link} onChange={(newLink) => onLinkChange(index, newLink)} showValidation={!!wrapperProps.error} />
            <ActionIcon color="var(--mantine-color-orange-6)" variant="outline" aria-label="Remove Link" size="lg" onClick={() => onRemoveLink(index)} disabled={index === 0 && onlyLinkIsBlank()}>
              <IconTrash />
            </ActionIcon>
          </Flex>
        ))}

        <Group justify="flex-end" gap={0}>
          <ActionIcon variant="outline" aria-label="Add Link" size="lg" onClick={onAddLink} disabled={lastLinkIsBlank()}>
            <IconPlus />
          </ActionIcon>
        </Group>
      </Stack>
    </Input.Wrapper>
  );
}

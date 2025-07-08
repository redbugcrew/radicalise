import { ActionIcon, Flex, Group, Input, Stack, type InputWrapperProps } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import LinkInput, { defaultLink, linkIsBlank, type LinkWithType } from "./LinkInput";
import { useUncontrolled } from "@mantine/hooks";

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
            <LinkInput key={index} value={link} placeholder={placeholder} defaultValue={link} onChange={(newLink) => onLinkChange(index, newLink)} />
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

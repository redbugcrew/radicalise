import { ActionIcon, Group, Input, Stack, type InputWrapperProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import LinkInput, { type LinkWithType } from "./LinkInput";
import { useUncontrolled } from "@mantine/hooks";

export type LinksWithType = LinkWithType[];

type LinksInputProps = InputWrapperProps & {
  value?: LinksWithType | undefined;
  defaultValue?: LinksWithType | undefined;
  onChange?: (value: LinksWithType) => void;
  placeholder?: string;
};

export default function LinksInput({ placeholder, value, defaultValue, onChange, ...wrapperProps }: LinksInputProps) {
  const [controlValue, setControlValue] = useUncontrolled<LinksWithType>({
    value: value,
    defaultValue: defaultValue,
    finalValue: undefined,
    onChange: onChange as any,
  });

  const onLinkChange = (index: number, newLink: LinkWithType) => {
    const updatedLinks = [...controlValue];
    updatedLinks[index] = newLink;
    setControlValue(updatedLinks);
  };

  return (
    <Input.Wrapper {...wrapperProps}>
      <Stack>
        {controlValue.map((link, index) => (
          <LinkInput key={index} value={link} placeholder={placeholder} defaultValue={link} onChange={(newLink) => onLinkChange(index, newLink)} />
        ))}

        <Group justify="flex-end" gap={0}>
          <ActionIcon variant="outline" aria-label="Add Interval" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Group>
      </Stack>
    </Input.Wrapper>
  );
}

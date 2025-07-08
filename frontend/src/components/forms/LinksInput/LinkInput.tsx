import { Flex, Input } from "@mantine/core";
import LinkTypeSelect, { type LinkType } from "./LinkTypeSelect";
import { useUncontrolled } from "@mantine/hooks";
import classes from "./LinksInput.module.css";

export type LinkWithType = {
  link_type: LinkType | undefined;
  url: string;
};

type LinkInputProps = {
  value?: LinkWithType | undefined;
  defaultValue?: LinkWithType | undefined;
  onChange?: (value: LinkWithType) => void;
  placeholder?: string;
};

export function defaultLink(): LinkWithType {
  return { link_type: undefined, url: "" };
}

export function linkIsBlank(link: LinkWithType | undefined): boolean {
  return !link || (!link.url && !link.link_type);
}

export default function LinkInput({ placeholder, value, defaultValue, ...props }: LinkInputProps) {
  const [controlValue, setControlValue] = useUncontrolled<LinkWithType>({
    value: value,
    defaultValue: defaultValue,
    finalValue: undefined,
    onChange: props.onChange as any,
  });

  const setLinkType = (link_type: LinkType) => {
    setControlValue({ ...controlValue, link_type });
  };

  const setUrl = (url: string) => {
    setControlValue({ ...controlValue, url });
  };

  return (
    <Flex direction="row" w={"100%"} gap={0}>
      <LinkTypeSelect key="link-type-select" value={controlValue?.link_type ?? null} classNames={{ input: classes.firstJoinedControl }} onChange={setLinkType} />
      <Input key="url-input" placeholder={placeholder} className={classes.urlTextInput} value={controlValue?.url} onChange={(event) => setUrl(event.currentTarget.value)} />
    </Flex>
  );
}

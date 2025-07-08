import { Flex, Input } from "@mantine/core";
import LinkTypeSelect, { type LinkType } from "./LinkTypeSelect";
import { useUncontrolled } from "@mantine/hooks";
import classes from "./LinksInput.module.css";

export type LinkWithType = {
  link_type: LinkType;
  url: string;
};

type LinkInputProps = {
  value?: LinkWithType | undefined;
  defaultValue?: LinkWithType | undefined;
  onChange?: (value: LinkWithType) => void;
  placeholder?: string;
};

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
      <LinkTypeSelect value={controlValue?.link_type} defaultValue={defaultValue?.link_type} classNames={{ input: classes.firstJoinedControl }} onChange={setLinkType} />
      <Input placeholder={placeholder} className={classes.urlTextInput} value={controlValue?.url} defaultValue={defaultValue?.url} onChange={(event) => setUrl(event.currentTarget.value)} />
    </Flex>
  );
}

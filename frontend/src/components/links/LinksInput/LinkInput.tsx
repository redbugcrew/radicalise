import { Flex, Input } from "@mantine/core";
import LinkTypeSelect, { linkTypeValidator } from "./LinkTypeSelect";
import { useUncontrolled } from "@mantine/hooks";
import classes from "./LinksInput.module.css";
import type { LinkType } from "../LinksDisplay/LinkDisplay";

export type LinkWithType = {
  link_type: LinkType | undefined;
  url: string;
  label: string;
};

type LinkInputProps = {
  value?: LinkWithType | undefined;
  defaultValue?: LinkWithType | undefined;
  onChange?: (value: LinkWithType) => void;
  placeholder?: string;
  showValidation?: boolean;
};

export function defaultLink(): LinkWithType {
  return { link_type: undefined, url: "", label: "" };
}

export function linkIsBlank(link: LinkWithType | undefined): boolean {
  return !link || (!link.url && !link.link_type && !link.label);
}

export function linkValidator(link: LinkWithType | undefined): string | null {
  if (!link) {
    return "Link is required";
  }
  const urlError = urlValidator(link.url);
  if (urlError) return urlError;

  const linkTypeError = linkTypeValidator(link.link_type);
  if (linkTypeError) return linkTypeError;

  return null;
}

function urlValidator(url: string | undefined): string | null {
  if (!url) {
    return "URL is required";
  }
  if (url.length < 5) {
    return "URL must be at least 5 characters long";
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "URL must start with https:// or http://";
  }
  if (url.length > 2048) {
    return "URL must be less than 2048 characters long";
  }
  return null;
}

export default function LinkInput({ placeholder, value, defaultValue, showValidation, ...props }: LinkInputProps) {
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

  const setLabel = (label: string) => {
    setControlValue({ ...controlValue, label });
  };

  return (
    <Flex direction="row" justify="flex-start" align="flex-start" w={"100%"} gap={0}>
      <LinkTypeSelect
        key="link-type-select"
        value={controlValue?.link_type ?? null}
        classNames={{ input: classes.firstJoinedControl }}
        onChange={setLinkType}
        error={showValidation && linkTypeValidator(controlValue?.link_type)}
      />
      <Flex direction="column" w="100%" gap="sm">
        <Input
          key="url-input"
          type="url"
          placeholder={placeholder}
          className={classes.urlTextInput}
          value={controlValue?.url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          error={showValidation && urlValidator(controlValue?.url)}
        />
        <Input key="label-input" type="text" placeholder="Label (optional)" className={classes.labelTextInput} value={controlValue?.label} onChange={(event) => setLabel(event.currentTarget.value)} />
      </Flex>
    </Flex>
  );
}

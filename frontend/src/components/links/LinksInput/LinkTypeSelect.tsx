import { Combobox, Flex, Input, useCombobox } from "@mantine/core";
import classes from "./LinksInput.module.css";
import { useUncontrolled } from "@mantine/hooks";
import { getLinkTypeIcon, linkTypes, type LinkType } from "../LinksDisplay/LinkDisplay";

function ItemWithIcon({ name, icon }: { name: LinkType; icon: React.ReactNode }) {
  return (
    <Flex align="center" gap="sm">
      {icon}
      <span>{name}</span>
    </Flex>
  );
}

type LinkTypeSelectProps = {
  value?: LinkType | undefined | null;
  defaultValue?: LinkType | undefined | null;
  onChange?: (value: LinkType) => void;
  classNames?: {
    input: string;
  };
  error?: string | boolean | null;
};

export function linkTypeValidator(value: LinkType | undefined | null): string | null {
  if (!value) {
    return "Link type is required";
  }
  if (!linkTypes.includes(value)) {
    return "Invalid link type";
  }
  return null;
}

export default function LinkTypeSelect({ classNames, value, defaultValue, error, ...props }: LinkTypeSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [controlValue, setControlValue] = useUncontrolled<LinkType | undefined | null>({
    value: value,
    defaultValue: defaultValue,
    finalValue: undefined,
    onChange: props.onChange as any,
  });

  const options = linkTypes.map((item) => (
    <Combobox.Option value={item} key={item}>
      <ItemWithIcon name={item} icon={getLinkTypeIcon(item)} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val: string) => {
        setControlValue(val as LinkType);
        combobox.closeDropdown();
      }}
      classNames={{ group: classes.typeSelectInput }}
    >
      <Combobox.Target>
        <Input component="button" type="button" pointer rightSection={<Combobox.Chevron />} onClick={() => combobox.toggleDropdown()} rightSectionPointerEvents="none" className={classNames?.input} error={error}>
          {controlValue ? <ItemWithIcon name={controlValue} icon={getLinkTypeIcon(controlValue)} /> : <Input.Placeholder>Pick type</Input.Placeholder>}
        </Input>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

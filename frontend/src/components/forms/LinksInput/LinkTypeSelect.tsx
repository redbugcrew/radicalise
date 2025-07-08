import { Combobox, Flex, Input, useCombobox } from "@mantine/core";
import { IconBrandMatrix, IconCircleLetterL, IconWorldWww } from "@tabler/icons-react";
import classes from "./LinksInput.module.css";
import { useUncontrolled } from "@mantine/hooks";

const iconProps = {
  size: 16,
};

export type LinkType = "Loomio" | "Matrix" | "Website";

const typeIcons: Record<LinkType, React.ReactNode> = {
  Loomio: <IconCircleLetterL {...iconProps} color="var(--mantine-color-yellow-5)" />,
  Matrix: <IconBrandMatrix {...iconProps} color="white" />,
  Website: <IconWorldWww {...iconProps} color="var(--mantine-color-blue-5)" />,
};

const linkTypes: LinkType[] = Object.keys(typeIcons) as LinkType[];

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
};

export default function LinkTypeSelect({ classNames, value, defaultValue, ...props }: LinkTypeSelectProps) {
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
      <ItemWithIcon name={item} icon={typeIcons[item]} />
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
        <Input component="button" type="button" pointer rightSection={<Combobox.Chevron />} onClick={() => combobox.toggleDropdown()} rightSectionPointerEvents="none" className={classNames?.input}>
          {controlValue ? <ItemWithIcon name={controlValue} icon={typeIcons[controlValue]} /> : <Input.Placeholder>Pick type</Input.Placeholder>}
        </Input>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

import { Combobox, Flex, Input, InputBase, useCombobox } from "@mantine/core";
import { IconBrandMatrix, IconCircleLetterL, IconWorldWww } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./LinksInput.module.css";

const iconProps = {
  size: 16,
};

const typeIcons: Record<string, React.ReactNode> = {
  Loomio: <IconCircleLetterL {...iconProps} color="var(--mantine-color-yellow-5)" />,
  Matrix: <IconBrandMatrix {...iconProps} color="white" />,
  Website: <IconWorldWww {...iconProps} color="var(--mantine-color-blue-5)" />,
};

const linkTypes: string[] = ["Loomio", "Matrix", "Website"];

function ItemWithIcon({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <Flex align="center" gap="sm">
      {icon}
      <span>{name}</span>
    </Flex>
  );
}

export default function LinkTypeSelect() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);

  const options = linkTypes.map((item) => (
    <Combobox.Option value={item} key={item}>
      <ItemWithIcon name={item} icon={typeIcons[item]} />
    </Combobox.Option>
  ));

  const item = linkTypes[0];

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
      classNames={{ group: classes.typeSelectInput }}
    >
      <Combobox.Target>
        <InputBase component="button" type="button" pointer rightSection={<Combobox.Chevron />} onClick={() => combobox.toggleDropdown()} rightSectionPointerEvents="none" classNames={{ input: classes.typeSelectInput }}>
          {value ? <ItemWithIcon name={value} icon={typeIcons[value]} /> : <Input.Placeholder>Pick type</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

import { Combobox, Input, InputBase, useCombobox, type InputWrapperProps } from "@mantine/core";
import { useState } from "react";
import Avatar, { maxAvatarId, minAvatarId } from "./Avatar";
import { useUncontrolled } from "@mantine/hooks";

const avatarIds = () => Array.from({ length: maxAvatarId - minAvatarId + 1 }, (_, i) => i + minAvatarId);

type AvatarSelectProps = InputWrapperProps & {
  value?: number | undefined;
  defaultValue?: number | undefined;
  onChange?: (value: number) => void;
  placeholder?: string;
};

export function AvatarSelect({ value, defaultValue, onChange, placeholder, ...wrapperProps }: AvatarSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [controlValue, setControlValue] = useUncontrolled<number | null>({
    value: value as number | null,
    defaultValue: defaultValue as number | null,
    finalValue: null,
    onChange: onChange as any,
  });

  // map between minAvatarId and maxAvatarId and create options for the combobox
  const options = avatarIds().map((id) => (
    <Combobox.Option value={id.toString()} key={id}>
      <Avatar avatarId={id} />
    </Combobox.Option>
  ));

  return (
    <Input.Wrapper {...wrapperProps}>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(valString) => {
          const val = parseInt(valString, 10);
          setControlValue(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase component="button" type="button" pointer rightSection={<Combobox.Chevron />} onClick={() => combobox.toggleDropdown()} rightSectionPointerEvents="none">
            {(controlValue && <Avatar avatarId={controlValue} />) || <Input.Placeholder>Pick value</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
  );
}

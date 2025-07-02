import { Combobox, Textarea, useCombobox } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";

export type ArrayOfStringTuples = [string, string][];

export type Hints = string[] | ArrayOfStringTuples;

type ComboTextAreaProps = React.ComponentProps<typeof Textarea> & {
  hints: Hints;
};

export default function ComboTextArea({ hints, ...props }: ComboTextAreaProps) {
  const combobox = useCombobox();
  // const [value, setValue] = useState<string>((props.value || props.defaultValue || "").toString());

  const [value, setValue] = useUncontrolled<string>({
    value: props.value as string,
    defaultValue: props.defaultValue as string,
    finalValue: "",
    onChange: props.onChange as any,
  });

  const options = hints.map((item) => {
    const [label, value] = typeof item === "string" ? [item, item] : item;

    return (
      <Combobox.Option value={value} key={value}>
        {label}
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        const hasContent = value.trim().length > 0;

        if (!hasContent) {
          setValue(optionValue);
        } else {
          const content = value.replace(/[\s\.\n]*$/, "");

          setValue(content + ". " + optionValue);
        }
        combobox.closeDropdown();
      }}
      store={combobox}
      withinPortal={false}
    >
      <Combobox.Target>
        <Textarea
          rows={4}
          label="Pick value or type anything"
          placeholder="Pick a value and/or type in any additional context."
          {...props}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

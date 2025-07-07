import { Flex, Input, type InputWrapperProps } from "@mantine/core";

import classes from "./LinksInput.module.css";
import LinkTypeSelect from "./LinkTypeSelect";

type LinksInputProps = InputWrapperProps & {
  placeholder?: string;
};

export default function LinksInput({ placeholder, ...wrapperProps }: LinksInputProps) {
  return (
    <Input.Wrapper {...wrapperProps}>
      <Flex direction="row" w={"100%"} gap={0}>
        <LinkTypeSelect />
        <Input placeholder={placeholder} className={classes.urlTextInput} />
      </Flex>
    </Input.Wrapper>
  );
}

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  components: {
    InputWrapper: {
      vars: (_theme: any, props: any) => {
        if (!props.size) {
          return {
            root: {
              "--input-label-size": "18px",
              "--input-description-size": "16px",
              "--input-fz": "16px",
            },
            description: {
              lineHeight: "1.3",
              paddingBottom: "0.2em",
            },
          };
        }

        return {};
      },
    },
  },
});

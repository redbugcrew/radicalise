import { Button, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

export interface ExpressionOfInterest {
  name: string;
  interest: string;
  context: string;
  howDidYouHear: string;
  transformativeJustice: string;
  existingConnections: string;
  contactInfo: string;
}

interface EOIFormProps {
  onSubmit: (values: ExpressionOfInterest) => void;
}

export default function EOIForm({ onSubmit }: EOIFormProps) {
  const form = useForm<ExpressionOfInterest>({
    mode: "controlled",
    initialValues: {
      name: "",
      interest: "",
      context: "",
      howDidYouHear: "",
      transformativeJustice: "",
      existingConnections: "",
      contactInfo: "",
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      contactInfo: (value) => (value ? null : "Contact info is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="How would you like us to refer to you?" {...form.getInputProps("name")} />

          <Textarea label="Interest" description="What interests you about participating in the Rhubarb Collective?" placeholder="Your message" rows={6} {...form.getInputProps("interest")} />
          <Textarea
            label="Context"
            description="What areas that the Rhubarb Collective is involved in are you already familiar with, and which ones are ones you're interested in learning more about?"
            placeholder="Your message"
            rows={6}
            {...form.getInputProps("context")}
          />
          <Textarea rows={2} label="How did you hear about us?" description="Where did you hear about the Rhubarb Collective?" {...form.getInputProps("howDidYouHear")} />

          <Textarea
            rows={3}
            label="Practicing transformative justice"
            description="Recognising that we all have the capacity to cause or experience harm - is there anything you would like to share about your experiences of learning and healing from conflict?"
            placeholder="Feel free to share here, or let us know if you would prefer to discuss this in person."
            {...form.getInputProps("transformativeJustice")}
          />

          <Textarea
            rows={2}
            label="Existing connections"
            description="Are there any connections to other Rhubarb Collective participants that you'd like to tell us about?"
            {...form.getInputProps("existingConnections")}
          />

          <Textarea rows={2} label="Contact info" description="Your email, phone, or any other way you would prefer us to reach you" {...form.getInputProps("contactInfo")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}

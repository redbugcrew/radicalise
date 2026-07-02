import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Anchor } from "../../../../components";
import PeerRoleTable from "../../components/PeerRoleTable";

export default function EventTemplates() {
  const PeerRoleTemplates = [
    { id: 1, project_id: 1, circle_id: 1, name: "Participation Buddies", distribution_type: "random", constrained: "no", constrained by id: "null" },
    { id: 2, project_id: 1, circle_id: 1, name: "Care Supporter", distribution_type: "special", constrained: "no", constrained by id: "null" },
    { id: 3, project_id: 1, circle_id: 1, name: "Conduct Supporter", distribution_type: "special", constrained: "yes", constrained by id: 2 },
  ];

 return (
     <Stack>
       <Group justify="space-between">
         <Title order={1}>Peer Role Templates</Title>
         <Anchor href="new">
           <ActionIcon variant="filled" aria-label="Add Peer Role Template" size="lg">
             <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
           </ActionIcon>
         </Anchor>
       </Group>
       <EventTemplatesTable eventTemplates={eventTemplates} />
     </Stack>
   );
}

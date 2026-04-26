import type { FormErrors, UseFormReturnType } from "@mantine/form";
import type { CrewInvolvement, OptOutType, ParticipationIntention } from "../../api/Api";

export interface MyParticipationFormData {
  private_capacity_planning: boolean;
  wellbeing: string;
  focus: string;
  capacity_score: string | null;
  capacity: string;
  participation_intention: ParticipationIntention | null;
  opt_out_type: OptOutType | null;
  opt_out_planned_return_date: string | null;
  crew_involvements: CrewInvolvement[];
  intention_context: string | null;
}

export type StepProps = {
  form: UseFormReturnType<MyParticipationFormData, MyParticipationFormData, (values: MyParticipationFormData) => FormErrors>;
  readOnly?: boolean;
};

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Group } from "../api/Api";

interface GroupObjectMap {
  [key: number]: Group;
}

export type GroupsState = GroupObjectMap;

const groupsSlice = createSlice({
  name: "groups",
  initialState: {} as GroupsState,
  reducers: {
    groupsLoaded: (_state: GroupsState, action: PayloadAction<Group[]>) => {
      const groups: GroupObjectMap = {};
      action.payload.forEach((group) => {
        groups[group.id] = group;
      });
      return groups;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { groupsLoaded } = groupsSlice.actions;

// Export the slice reducer as the default export
export default groupsSlice.reducer;

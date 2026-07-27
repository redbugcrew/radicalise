import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PeerRole } from "../api/Api";

export interface PeerRolesObjectMap {
  [key: number]: PeerRole;
}

const peerRolesSlice = createSlice({
  name: "peer_roles",
  initialState: {} as PeerRolesObjectMap,
  reducers: {
    peerRolesLoaded: (_state: PeerRolesObjectMap, action: PayloadAction<PeerRole[]>) => {
      const newState: PeerRolesObjectMap = {};
      action.payload.forEach((peerRole) => {
        newState[peerRole.id] = peerRole;
      });
      return newState;
    },
  },
});

export const { peerRolesLoaded } = peerRolesSlice.actions;

// Export the slice reducer as the default export
export default peerRolesSlice.reducer;

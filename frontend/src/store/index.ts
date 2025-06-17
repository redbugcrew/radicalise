import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer from "./collective";

const store = configureStore({
  reducer: {
    collective: collectiveReducer,
  },
});

export default store;

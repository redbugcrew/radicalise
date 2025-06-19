import { useDispatch, useSelector, useStore } from "react-redux";
import { Api } from "../api/Api";
import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer, { collectiveLoaded } from "./collective";
import peopleReducer, { peopleLoaded } from "./people";
import intervalsReducer, { intervalsLoaded } from "./intervals";
import involvementsReducer, { involvementsLoaded } from "./involvements";

const store = configureStore({
  reducer: {
    collective: collectiveReducer,
    people: peopleReducer,
    intervals: intervalsReducer,
    involvements: involvementsReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export async function loadInitialData(store: AppStore) {
  const api = new Api({
    baseURL: "http://localhost:8000",
  });

  const dataHasLoaded = store.getState().collective;

  if (!dataHasLoaded) {
    api.collective.getState().then((response) => {
      store.dispatch(collectiveLoaded(response.data.collective));
      store.dispatch(peopleLoaded(response.data.people));
      store.dispatch(intervalsLoaded({ allIntervals: response.data.intervals, currentInterval: response.data.current_interval }));
      store.dispatch(involvementsLoaded(response.data.involvements));
    });
  }
}

export default store;

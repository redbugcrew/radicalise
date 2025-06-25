import { useDispatch, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer, { collectiveLoaded } from "./collective";
import peopleReducer, { peopleLoaded } from "./people";
import intervalsReducer, { intervalsLoaded } from "./intervals";
import involvementsReducer, { involvementsLoaded } from "./involvements";
import crewsReducer, { crewsLoaded } from "./crews";
import { getApi } from "../api";
import { redirect } from "react-router-dom";

const store = configureStore({
  reducer: {
    collective: collectiveReducer,
    people: peopleReducer,
    intervals: intervalsReducer,
    involvements: involvementsReducer,
    crews: crewsReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// const initialDataLoaded = (data: any) => ({
//   type: "initialDataLoaded",
//   payload: data,
// });

export async function loadInitialData(store: AppStore) {
  const api = getApi();

  const dataHasLoaded = store.getState().collective;

  if (!dataHasLoaded) {
    console.log("Loading initial data from API...");
    return api.api
      .getState()
      .then((response) => {
        store.dispatch(peopleLoaded(response.data.people));
        store.dispatch(crewsLoaded(response.data.crews));
        store.dispatch(intervalsLoaded({ allIntervals: response.data.intervals, currentInterval: response.data.current_interval }));
        store.dispatch(involvementsLoaded(response.data.involvements));
        store.dispatch(collectiveLoaded(response.data.collective));

        return null;
      })
      .catch((error) => {
        if (error.response.status === 401) {
          console.error("Unauthorized:", error);
          return redirect("/auth/login");
        } else {
          console.error("Error loading initial data:", error);
          return null;
        }
      });
  }
  return null;
}

export default store;

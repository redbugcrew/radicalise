import { useDispatch, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer, { collectiveLoaded } from "./collective";
import peopleReducer, { peopleLoaded } from "./people";
import intervalsReducer, { intervalsLoaded } from "./intervals";
import involvementsReducer, { involvementsLoaded } from "./involvements";
import crewsReducer, { crewsLoaded } from "./crews";
import meReducer, { meLoaded, myIntervalDataChanged } from "./me";
import { getApi } from "../api";
import { redirect } from "react-router-dom";
import type { MeEvent } from "../api/Api";

const store = configureStore({
  reducer: {
    collective: collectiveReducer,
    people: peopleReducer,
    intervals: intervalsReducer,
    involvements: involvementsReducer,
    crews: crewsReducer,
    me: meReducer,
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

async function loadCollectiveData(store: AppStore, api: ReturnType<typeof getApi>): Promise<Response | null> {
  return api.api
    .getCollectiveState()
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

async function loadMeData(store: AppStore, api: ReturnType<typeof getApi>): Promise<Response | null> {
  return api.api
    .getMyState()
    .then((response) => {
      store.dispatch(meLoaded(response.data));
      return null;
    })
    .catch((error) => {
      if (error.response.status === 401) {
        console.error("Unauthorized:", error);
        return redirect("/auth/login");
      } else {
        console.error("Error loading 'me' data:", error);
        return null;
      }
    });
}

export async function loadInitialData(store: AppStore) {
  const api = getApi();

  const dataHasLoaded = store.getState().collective;

  if (!dataHasLoaded) {
    console.log("Loading initial data from API...");
    return loadMeData(store, api).then(() => loadCollectiveData(store, api));
  }
  return null;
}

export async function handleMeEvent(event: MeEvent) {
  console.log("Handling MeEvent:", event);
  if (event.MyIntervalDataChanged) {
    store.dispatch(myIntervalDataChanged(event.MyIntervalDataChanged));
  }
}

export async function handleMeEvents(events: MeEvent[]) {
  events.forEach((event) => handleMeEvent(event));
}

export default store;

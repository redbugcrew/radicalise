import { useDispatch, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer, { collectiveLoaded, collectiveUpdated } from "./collective";
import peopleReducer, { peopleLoaded } from "./people";
import intervalsReducer, { intervalsLoaded, intervalCreated } from "./intervals";
import involvementsReducer, { involvementsLoaded } from "./involvements";
import crewsReducer, { crewsLoaded, crewUpdated } from "./crews";
import meReducer, { meLoaded, myIntervalDataChanged } from "./me";
import { getApi } from "../api";
import { redirect } from "react-router-dom";
import type { AppEvent, CollectiveEvent, CrewsEvent, IntervalsEvent, MeEvent } from "../api/Api";

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

export async function handleIntervalsEvent(event: IntervalsEvent) {
  console.log("Handling IntervalsEvent:", event);
  if (event.IntervalCreated) {
    store.dispatch(intervalCreated(event.IntervalCreated));
  }
}

export async function handleCrewsEvent(event: CrewsEvent) {
  console.log("Handling CrewsEvent:", event);
  if (event.CrewUpdated) {
    store.dispatch(crewUpdated(event.CrewUpdated));
  }
}

export async function handleCollectiveEvent(event: CollectiveEvent) {
  console.log("Handling CollectiveEvent:", event);
  if (event.CollectiveUpdated) {
    store.dispatch(collectiveUpdated(event.CollectiveUpdated));
  }
}

export async function handleAppEvent(event: AppEvent) {
  console.log("Handling AppEvent:", event);

  if ("MeEvent" in event && event.MeEvent) {
    handleMeEvent(event.MeEvent);
  } else if ("IntervalsEvent" in event && event.IntervalsEvent) {
    handleIntervalsEvent(event.IntervalsEvent);
  } else if ("CrewsEvent" in event && event.CrewsEvent) {
    handleCrewsEvent(event.CrewsEvent);
  } else if ("CollectiveEvent" in event && event.CollectiveEvent) {
    handleCollectiveEvent(event.CollectiveEvent);
  } else {
    console.warn("Unknown event type:", event);
  }
}

export async function handleAppEvents(events: AppEvent[]) {
  events.forEach(handleAppEvent);
}

export interface OwnedAppEvent {
  author_id: number;
  event: AppEvent;
}

export async function handleOwnedAppEvent(current_user_id: number, event: OwnedAppEvent) {
  if (event.author_id !== current_user_id) {
    handleAppEvent(event.event);
  } else {
    console.log("Ignoring event authored by the current user:", event.author_id);
  }
}

export default store;

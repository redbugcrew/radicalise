import { Navigate, RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store, { loadInitialData, type AppStore } from "./store";
import { MantineProvider } from "@mantine/core";
import {
  EditPerson,
  CreateEoi,
  Layout,
  Dashboard,
  NewPerson,
  People,
  Person,
  MyParticipation,
  Crews,
  EditCrew,
  Intervals,
  NewInterval,
  EditCollective,
  EntryPathways,
  DisplayEntryPathway,
  ManageMyEoi,
  PublicWithCollective,
  Dev,
} from "./pages";
import { buildRoutes as buildAuthRoutes } from "./contexts/auth";
import { theme } from "./theme";
import { EditEventTemplate, Events, EventTemplates, NewEventTemplate, NewEvent, ShowEvent, EditEvent } from "./contexts/events";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

function withStore(func: (store: AppStore) => any, store: AppStore): LoaderFunction<any> {
  const wrappedFunc: LoaderFunction<any> = async () => {
    return func(store);
  };
  return wrappedFunc;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: withStore(loadInitialData, store),
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "collective/edit",
        element: <EditCollective />,
      },
      {
        path: "people",
        element: <People />,
      },
      {
        path: "people/new",
        element: <NewPerson />,
      },
      {
        path: "people/:personId/edit",
        element: <EditPerson />,
      },
      {
        path: "people/:personId",
        element: <Person />,
      },
      {
        path: "crews",
        element: <Crews />,
      },
      {
        path: "crews/:crewId/edit",
        element: <EditCrew />,
      },
      {
        path: "intervals",
        element: <Intervals />,
      },
      {
        path: "intervals/new",
        element: <NewInterval />,
      },
      {
        path: "my_participation/:intervalId",
        element: <MyParticipation />,
      },
      {
        path: "entry_pathways",
        element: <EntryPathways />,
      },
      {
        path: "entry_pathways/:entryPathwayId",
        element: <DisplayEntryPathway />,
      },
      {
        path: "events",
        children: [
          {
            path: "event_templates",
            children: [
              { path: "", element: <EventTemplates /> },
              { path: "new", element: <NewEventTemplate /> },
              { path: ":templateId/edit", element: <EditEventTemplate /> },
            ],
          },
          {
            path: "",
            element: <Events />,
          },
          { path: "new", element: <NewEvent /> },
          { path: ":eventId", element: <ShowEvent /> },
          { path: ":eventId/edit", element: <EditEvent /> },
        ],
      },
      {
        path: "dev",
        element: <Dev />,
      },
    ],
  },
  {
    path: "/auth",
    children: buildAuthRoutes(),
  },
  {
    path: "collective/:collectiveSlug",
    element: <PublicWithCollective />,
    children: [
      {
        path: "interest",
        element: <CreateEoi />,
      },
      {
        path: "interest/:authToken",
        element: <ManageMyEoi />,
      },
    ],
  },
]);

function App() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </MantineProvider>
  );
}

export default App;

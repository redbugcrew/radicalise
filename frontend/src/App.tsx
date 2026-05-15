import { Navigate, RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store, { loadInitialData, type AppStore } from "./store";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  EditPerson,
  CreateEoi,
  Layout,
  Dashboard,
  People,
  Person,
  MyParticipation,
  Crews,
  EditCrew,
  Intervals,
  NewInterval,
  EditProject,
  EntryPathways,
  DisplayEntryPathway,
  ManageMyEoi,
  PublicWithProject,
  Dev,
  InvitePerson,
} from "./pages";
import { buildRoutes as buildAuthRoutes } from "./contexts/auth";
import { theme } from "./theme";
import { EditEventTemplate, Events, EventTemplates, NewEventTemplate, NewEvent, ShowEvent, EditEvent, UpcomingEvents, AllEvents } from "./contexts/events";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { Circles, EditCircle, NewCircle } from "./contexts/circles";

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
        path: "project_settings",
        children: [
          {
            path: "edit",
            element: <EditProject />,
          },
          {
            path: "circles",
            children: [
              {
                path: "",
                element: <Circles />,
              },
              {
                path: "new",
                element: <NewCircle />,
              },
              {
                path: ":circleSlug/edit",
                element: <EditCircle />,
              },
            ],
          },
        ],
      },
      {
        path: "people",
        children: [
          {
            path: "",
            element: <People />,
          },
          {
            path: ":personId/edit",
            element: <EditPerson />,
          },
          {
            path: ":personId",
            element: <Person />,
          },
        ],
      },
      {
        path: "invitations",
        children: [
          {
            path: "new",
            element: <InvitePerson />,
          },
        ],
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
            children: [
              { path: "", element: <UpcomingEvents /> },
              { path: "list/:tabValue", element: <AllEvents /> },
            ],
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
    path: "collective/:projectSlug",
    element: <PublicWithProject />,
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
  {
    path: "project/:projectSlug",
    element: <PublicWithProject />,
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
      <Notifications />
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </MantineProvider>
  );
}

export default App;

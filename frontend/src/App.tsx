import { Navigate, RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom"
import { Provider as ReduxProvider } from "react-redux"
import store, { loadInitialData, type AppStore } from "./store"
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import {
  EditPerson,
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
  PublicWithProject,
  Dev,
  InvitePerson,
  AcceptInvitation,
  LoadProject,
} from "./pages"
import { buildRoutes as buildAuthRoutes } from "./contexts/auth"
import { theme } from "./theme"
import {
  EditEventTemplate,
  Events,
  EventTemplates,
  NewEventTemplate,
  NewEvent,
  ShowEvent,
  EditEvent,
  UpcomingEvents,
  AllEvents,
} from "./contexts/events"

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import { Circles, EditCircle, NewCircle } from "./contexts/circles"
import { PeerRoles } from "./contexts/peer_roles"
import NewRole from "./contexts/peer_roles/pages/NewRole"
//import NewRole from "./contexts/peer_roles/pages/NewRole";

function withStore(func: (store: AppStore) => any, store: AppStore): LoaderFunction<any> {
  const wrappedFunc: LoaderFunction<any> = async () => {
    return func(store)
  }
  return wrappedFunc
}

const router = createBrowserRouter([
  {
    path: "/",
    // element: <Layout />,
    // loader: withStore(loadInitialData, store),
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
        path: "invitations",
        children: [
          {
            path: "new",
            element: <InvitePerson />,
          },
        ],
      },
      {
        path: "my_participation/:intervalId",
        element: <MyParticipation />,
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
    path: "project/:projectSlug/pub",
    element: <PublicWithProject />,
    children: [
      {
        path: "invitation",
        children: [
          {
            path: "accept",
            element: <AcceptInvitation />,
          },
        ],
      },
    ],
  },
  {
    path: "project/:projectSlug",
    element: <LoadProject />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
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
            path: "crews",
            children: [
              {
                path: "",
                element: <Crews />,
              },
              {
                path: ":crewId/edit",
                element: <EditCrew />,
              },
            ],
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
            path: "intervals",
            children: [
              {
                path: "",
                element: <Intervals />,
              },
              {
                path: "new",
                element: <NewInterval />,
              },
            ],
          },
          {
            path: "peer_roles",
            children: [
              {
                path: "",
                element: <PeerRoles />,
              },
              {
                path: "new",
                element: <NewRole />,
              },
            ],
          },
        ],
      },
    ],
  },
])

function App() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Notifications />
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </MantineProvider>
  )
}

export default App

import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import { Provider as ReduxProvider } from "react-redux"
import store from "./store"
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
  InvitePerson,
  AcceptInvitation,
} from "./pages"
import { LoadSelectedProject, LoadProjectState, LoadMyProjects } from "./contexts/projects"
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
import ProjectLayout from "./pages/Layout/ProjectLayout"
import { EditProject, NewProject } from "./contexts/projects"
//import NewRole from "./contexts/peer_roles/pages/NewRole";

const router = createBrowserRouter([
  {
    path: "/auth",
    children: buildAuthRoutes(),
  },
  {
    path: "project/:projectSlug/pub",
    element: <LoadSelectedProject />,
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
    path: "/",
    element: <Navigate to="/project" replace />,
  },
  {
    path: "projects/new",
    element: <NewProject />,
  },
  {
    path: "project",
    element: <LoadMyProjects />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          {
            path: ":projectSlug",
            element: <LoadSelectedProject />,
            children: [
              {
                path: "",
                element: <LoadProjectState />,
                children: [
                  {
                    path: "",
                    element: <ProjectLayout />,
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
                        path: "invitations",
                        children: [
                          {
                            path: "new",
                            element: <InvitePerson />,
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
                      {
                        path: "my_participation/:intervalId",
                        element: <MyParticipation />,
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
                    ],
                  },
                ],
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

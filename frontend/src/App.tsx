import { Layout } from "./pages";
import { Navigate, RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store, { loadInitialData, type AppStore } from "./store";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import { MantineProvider } from "@mantine/core";
import { Dashboard, NewPerson, People, Person, MyParticipation, Crews, Intervals, NewInterval } from "./pages";
import { buildRoutes as buildAuthRoutes } from "./contexts/auth";
import { theme } from "./theme";

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
        path: "people",
        element: <People />,
      },
      {
        path: "people/new",
        element: <NewPerson />,
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
    ],
  },
  {
    path: "/auth",
    children: buildAuthRoutes(),
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

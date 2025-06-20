import Layout from "./pages/Layout";
import { Navigate, RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store, { loadInitialData, type AppStore } from "./store";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { Login, ForgotPassword, Dashboard, NewPerson, People, Person } from "./pages";

function withStore(func: (store: AppStore) => void, store: AppStore): LoaderFunction<any> {
  const wrappedFunc: LoaderFunction<any> = async () => {
    return func(store);
  };
  return wrappedFunc;
}

function loadParticipants(_store: AppStore): void {}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: withStore(loadInitialData, store),
    children: [
      {
        path: "",
        element: <Navigate to="people" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "people",
        element: <People />,
        loader: withStore(loadParticipants, store),
      },
      {
        path: "people/new",
        element: <NewPerson />,
      },
      {
        path: "people/:personId",
        element: <Person />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot_password",
    element: <ForgotPassword />,
  },
]);

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </MantineProvider>
  );
}

export default App;

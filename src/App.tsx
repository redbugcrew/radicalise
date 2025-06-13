import Layout from "./pages/Layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import People from "./pages/People";
import Person from "./pages/Person";
import NewPerson from "./pages/NewPerson";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
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
    ],
  },
]);

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;

import Layout from "./pages/Layout";
import { RouterProvider, createBrowserRouter, type LoaderFunction } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { Login, ForgotPassword, Dashboard, NewPerson, People, Person } from "./pages";
import type { EnhancedStore, UnknownAction, Tuple, StoreEnhancer, ThunkDispatch } from "@reduxjs/toolkit";
import { collectiveLoaded } from "./store/collective";
import { intervalsLoaded } from "./store/intervals";
import { peopleLoaded } from "./store/people";
import { Api } from "./api/Api";

type ThisStoreType = EnhancedStore<any, UnknownAction, Tuple<[StoreEnhancer<{ dispatch: ThunkDispatch<any, undefined, UnknownAction> }>, StoreEnhancer]>>;

async function loadCollective(store: ThisStoreType) {
  const api = new Api({
    baseURL: "http://localhost:8000",
  });

  const dataHasLoaded = store.getState().collective;

  if (!dataHasLoaded) {
    api.collective.getState().then((response) => {
      store.dispatch(collectiveLoaded(response.data.collective));
      store.dispatch(peopleLoaded(response.data.people));
      store.dispatch(intervalsLoaded(response.data.intervals));
    });
  }
}

function withStore(func: (store: ThisStoreType) => void, store: ThisStoreType): LoaderFunction<any> {
  const wrappedFunc: LoaderFunction<any> = async () => {
    return func(store);
  };
  return wrappedFunc;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: withStore(loadCollective, store),
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

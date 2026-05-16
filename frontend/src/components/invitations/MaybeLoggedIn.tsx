import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { getApi } from "../../api";
import { notifications } from "@mantine/notifications";

export interface LoggedInOrNotProps {
  children: (loggedIn: boolean, handleAuthFailure: () => void) => JSX.Element;
}

export default function MaybeLoggedIn({ children }: LoggedInOrNotProps) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const handleAuthFailure = () => {
    checkLoginStatus();
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    getApi()
      .api.getCurrentUser()
      .then((response) => {
        console.log("Login status response:", response);
        setLoggedIn(!!response.data?.user_id);
      })
      .catch((error) => {
        console.log("Error checking login status:", error);
        notifications.show({
          title: "Error checking login status",
          message: "An error occurred while checking your login status. Please try again.",
          color: "red",
        });
        setLoggedIn(false);
      });
  };

  console.log("Logged in status is now:", loggedIn);

  if (loggedIn === null) return null; // or a loading spinner

  return children(loggedIn, handleAuthFailure);
}

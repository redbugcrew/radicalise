import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("pages/Layout.tsx", [
    route("dashboard", "pages/Dashboard.tsx"), //
    route("people", "pages/People.tsx"),
    route("people/new", "pages/NewPerson.tsx"),
    route("people/:personId", "pages/Person.tsx"),
    route("*?", "catchall.tsx"),
  ]),
  route("login", "pages/Login/Login.tsx"),
  route("forgot_password", "pages/ForgotPassword/ForgotPassword.tsx"),
] satisfies RouteConfig;

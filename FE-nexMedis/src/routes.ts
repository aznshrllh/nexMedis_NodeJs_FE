import { createBrowserRouter, redirect } from "react-router-dom";
import React from "react";
import MainPage from "./pages/mainPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(MainPage),
    loader: () => {
      if (!localStorage.accessToken) {
        return redirect("/login");
      }
      return null;
    },
    children: [
      {
        path: "",
        element: React.createElement(""),
      },
      {
        path: "dashboard",
        element: React.createElement(""),
      },
      {
        path: "products",
        element: React.createElement(""),
      },
      {
        path: "carts",
        element: React.createElement(""),
      },
      {
        path: "transactions",
        element: React.createElement(""),
      },
      {
        path: "top-buyer",
        element: React.createElement(""),
      },
    ],
  },
  {
    path: "/login",
    element: React.createElement(LoginPage),
    loader: () => {
      if (localStorage.accessToken) {
        return redirect("/");
      }
      return null;
    },
  },
  {
    path: "/register",
    element: React.createElement(RegisterPage),
    loader: () => {
      if (localStorage.accessToken) {
        return redirect("/");
      }
      return null;
    },
  },
]);

export default router;

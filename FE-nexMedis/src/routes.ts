import { createBrowserRouter, redirect } from "react-router-dom";
import React from "react";
import MainPage from "./pages/mainPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import HomePage from "./pages/homePage";
import ProductPage from "./pages/productPage";
import CartPage from "./pages/cartPage";
import TransactionPage from "./pages/transactionPage";
import UserPage from "./pages/UserPage";

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
        element: React.createElement(HomePage),
      },
      {
        path: "products",
        element: React.createElement(ProductPage),
      },
      {
        path: "carts",
        element: React.createElement(CartPage),
      },
      {
        path: "transactions",
        element: React.createElement(TransactionPage),
      },
      {
        path: "top-buyer",
        element: React.createElement(UserPage),
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

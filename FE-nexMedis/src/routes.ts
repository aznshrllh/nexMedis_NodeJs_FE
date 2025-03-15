import { createBrowserRouter, redirect } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    // element: <Home />,
    loader: () => {
      if (!localStorage.accessToken) {
        return redirect("/login");
      }
      return null;
    },
  },
]);

export default router;

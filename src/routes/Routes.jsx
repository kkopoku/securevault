import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "../Root.jsx";
import Home from "../pages/Home.jsx";
import OtherPage from "../pages/OtherPage.jsx";

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/:id?",
          element: <Home />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;

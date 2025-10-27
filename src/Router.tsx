import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";

const routers = createBrowserRouter([
  {
    path: "*",
    element: <NewsPage />,
  },
  {
    path: "/:id",
    element: <NewsDetail />,
  },
]);

export const Router = () => {
  return <RouterProvider router={routers} />;
};

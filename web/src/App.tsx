import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import Loading from "@/components/Loading";
import ErrorBoundary from "@/routes/ErrorBoundary";
import Index from "@/routes/index";
import Conversation, { loader as convLoader } from "@/routes/conversation";
import Root, { loader as rootLoader } from "@/routes/root";
import Share, { loader as shareLoader } from "@/routes/share";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      loader: rootLoader,
      shouldRevalidate: () => false,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: "/chat/:id",
          element: (
            <Suspense fallback={<Loading />}>
              <Conversation />
            </Suspense>
          ),
          loader: convLoader,
          shouldRevalidate: ({ currentParams, nextParams }) => {
            // prevent revalidating when clicking on the same conv
            return currentParams.id !== nextParams.id;
          },
        },
      ],
    },
    {
      path: "/share/:id",
      element: (
        <Suspense fallback={<Loading />}>
          <Share />
        </Suspense>
      ),
      loader: shareLoader,
      errorElement: <ErrorBoundary />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

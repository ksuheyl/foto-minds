import BaseLayout from "./layouts/BaseLayout";
import { Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import webPageRoutes from "./routes/webPageRoutes";
import userRoutes from "./routes/userRoutes"
import { loadUser } from "./store/auth/authSlice";
import LoadingOverlay from "./components/custom/LoadingOverlay";

function ErrorBoundary({ children }) {
  return (
    <Suspense fallback={<LoadingOverlay open={true} />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatchEvent = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Initialize App
  const memoizedDispatchEvent = useCallback(
    (action) => dispatchEvent(action),
    [dispatchEvent]
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        if (localStorage.token) await memoizedDispatchEvent(loadUser());
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only call this on mount
    initializeApp();
  }, [memoizedDispatchEvent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Render Routes
  const renderRoutes = (routeList) =>
    routeList.map((route) =>
      route.collapse ? (
        renderRoutes(route.collapse)
      ) : route.route ? (
        <Route
          key={route.key}
          exact
          path={route.route}
          element={route.component}
        />
      ) : null
    );

  // Loading State
  if (loading) return <LoadingOverlay open={loading} />;

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {renderRoutes(webPageRoutes)}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <BaseLayout>
          <Routes>
            {renderRoutes(userRoutes)}
            <Route path="*" element={<Navigate to="/home" />}/>
          </Routes>
        </BaseLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

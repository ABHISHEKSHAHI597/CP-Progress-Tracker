import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import ContestCalendar from "./pages/ContestCalendar";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Loader from "./components/Loader";

// Recharts is only needed on the progress page, so it loads with it.
const ContestTracker = lazy(() => import("./pages/ContestTracker"));

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="figure wide text-[44px] font-semibold text-faint">404</p>

      <h1 className="text-[20px] font-semibold mt-3">This page does not exist</h1>

      <p className="text-mute text-[14px] mt-2">
        The link may be out of date.
      </p>

      <Link
        to="/"
        className="inline-block mt-6 px-4 py-2 rounded-md bg-paper text-ink text-[14px] font-medium hover:bg-white transition-colors"
      >
        Go to the overview
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/contests"
            element={
              <Suspense fallback={<Loader label="Loading contest history" />}>
                <ContestTracker />
              </Suspense>
            }
          />
          <Route path="/calendar" element={<ContestCalendar />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

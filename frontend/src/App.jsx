import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ContestTracker from "./pages/ContestTracker";
import ContestCalendar from "./pages/ContestCalendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/contests" element={<ContestTracker />} />
          <Route path="/calendar" element={<ContestCalendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
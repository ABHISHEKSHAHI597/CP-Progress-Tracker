import { Navigate } from "react-router-dom";

import { useAuth } from "../lib/auth-context";
import Loader from "./Loader";

function ProtectedRoute({ children }) {
  const { status } = useAuth();

  // On a fresh load the cookie has not been checked yet. Waiting here is what
  // stops a signed-in admin from seeing the login page flash past on refresh.
  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader label="Checking your session" />
      </div>
    );
  }

  if (status !== "in") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

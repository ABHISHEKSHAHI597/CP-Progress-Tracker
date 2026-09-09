import { Navigate } from "react-router-dom";

import { isSignedIn } from "../lib/session";

function ProtectedRoute({ children }) {
  if (!isSignedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

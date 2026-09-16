import { createContext, useContext } from "react";

/**
 * The admin session lives in an HttpOnly cookie, which this code cannot read
 * by design — that is the point of it, since a script that cannot read the
 * token cannot leak it either. So the app asks the server instead, once on
 * load, and remembers the answer here.
 *
 *   "checking"  the answer has not come back yet
 *   "in"        the cookie is valid
 *   "out"       there is no session, or it expired
 *
 * AuthProvider fills this in.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

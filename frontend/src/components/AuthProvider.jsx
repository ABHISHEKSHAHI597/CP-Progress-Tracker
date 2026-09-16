import { useCallback, useEffect, useMemo, useState } from "react";

import API from "../services/api";
import { AuthContext } from "../lib/auth-context";

function AuthProvider({ children }) {
  const [status, setStatus] = useState("checking");
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let live = true;

    API.get("/admin/session")
      .then((res) => {
        if (!live) return;

        setStatus(res.data?.signedIn ? "in" : "out");
        setUsername(res.data?.username ?? null);
      })
      .catch(() => {
        // The API is unreachable. Treat that as signed out rather than
        // leaving the app stuck on a spinner.
        if (live) setStatus("out");
      });

    return () => {
      live = false;
    };
  }, []);

  // An hour in, a request comes back 401 and the session is over. The axios
  // interceptor announces it here so the app can react in place, instead of
  // reloading the page out from under whatever the admin was doing.
  useEffect(() => {
    const onExpired = () => {
      setStatus("out");
      setUsername(null);
    };

    window.addEventListener("auth:expired", onExpired);

    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const signIn = useCallback(async (name, password) => {
    const res = await API.post("/admin/login", {
      username: name,
      password,
    });

    setUsername(res.data?.username ?? null);
    setStatus("in");
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Only the server can clear an HttpOnly cookie.
      await API.post("/admin/logout");
    } catch {
      // Already expired, or the API is down. Either way this browser is done
      // with the session, so fall through and drop it locally.
    }

    setUsername(null);
    setStatus("out");
  }, []);

  const value = useMemo(
    () => ({ status, username, signIn, signOut }),
    [status, username, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

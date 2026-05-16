import { type JSX, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface TokenOrRedirectProps {
  children: (token: string) => JSX.Element;
  redirectTo?: string;
}

export default function TokenOrRedirect({ children, redirectTo }: TokenOrRedirectProps) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryToken = queryParams.get("token");
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!queryToken) {
      navigate(redirectTo ?? "/");
    } else {
      setToken(queryToken);
    }
  }, [queryToken]);

  if (!token) return null;
  return children(token);
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import jwtDecode from "jwt-decode"; // Install this via `npm install jwt-decode`

const withAuth = (WrappedComponent) => {
  return function AuthWrapper(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");
      const exp = localStorage.getItem("exp");
      const currentTime = Date.now() / 1000;
      if (!token || !exp || exp < currentTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("exp");
        router.push("/admin/login");
        return;
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

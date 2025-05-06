import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
//import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "../index.css";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    const pathname = window.location.pathname;
    
    if (pathname === "/" || pathname === "") {
      if (token) {
        throw redirect({
          to: "/welcome"
        });
      } else {
        throw redirect({
          to: "/login"
        });
      }
    }

    if (!token && !pathname.startsWith("/login")) {
      throw redirect({
        to: "/login"
      });
    }
  }
});

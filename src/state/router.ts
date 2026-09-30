import { useEffect, useState } from "react";
import type { Route } from "./types";

const HASHES: Record<string, Route> = {
  "": "threshold",
  "/": "threshold",
  clock: "clock",
  society: "society",
  energy: "energy",
  break: "break",
  lifeline: "lifeline",
  about: "about",
  "/about": "about",
};

export const ROUTE_HASH: Record<Route, string> = {
  threshold: "#/",
  clock: "#clock",
  society: "#society",
  energy: "#energy",
  break: "#break",
  lifeline: "#lifeline",
  about: "#/about",
};

function read(): Route | "unknown" {
  const h = window.location.hash.replace(/^#/, "");
  return HASHES[h] ?? "unknown";
}

export function go(route: Route) {
  window.location.hash = ROUTE_HASH[route];
}

export function useRoute(): Route | "unknown" {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

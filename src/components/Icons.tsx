import type { ReactNode } from "react";
import type { VF } from "../state/types";

export type IconId = VF | "idle";

/** 1px-stroke line icons on a 24 grid. Colour comes from `currentColor`. */
const PATHS: Record<IconId, ReactNode> = {
  parenting: (
    <>
      <circle cx="10" cy="8" r="3" />
      <path d="M4 20v-2a6 6 0 0 1 12 0v2" />
      <path d="M19 4v6M16 7h6" />
    </>
  ),
  hunting: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
    </>
  ),
  property: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  curation: (
    <>
      <path d="M2 12c3-6 17-6 20 0-3 6-17 6-20 0z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  governance: (
    <>
      <path d="M3 9l9-5 9 5z" />
      <path d="M6 11v7M10 11v7M14 11v7M18 11v7M3 20h18" />
    </>
  ),
  organizations: (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M11 6.8L6 16.2M13 6.8l5 9.4M7 18h10" />
    </>
  ),
  communication: (
    <>
      <path d="M4 5h16v10h-8l-4 4v-4H4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  farming: (
    <>
      <path d="M12 21V11" />
      <path d="M12 11C12 6 8 5 5 5c0 4 3 6 7 6z" />
      <path d="M12 15c0-5 4-6 7-6 0 4-3 6-7 6z" />
      <path d="M8 21h8" />
    </>
  ),
  portal: (
    <>
      <path d="M6 21V11a6 6 0 0 1 12 0v10" />
      <path d="M9.5 21v-9.5a2.5 2.5 0 0 1 5 0V21" />
      <path d="M3 21h18" />
    </>
  ),
  idle: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8" />
    </>
  ),
};

export function Icon({ id, size = 22 }: { id: IconId; size?: number }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  );
}

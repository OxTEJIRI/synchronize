import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { ActClock } from "./screens/ActClock";
import { About } from "./screens/About";
import { ActSim } from "./screens/ActSim";
import { ActSociety } from "./screens/ActSociety";
import { Lifeline } from "./screens/Lifeline";
import { NotFound } from "./screens/Placeholders";
import { Threshold } from "./screens/Threshold";
import { go, useRoute } from "./state/router";
import { canVisit, markVisited, useSession } from "./state/store";

export function App() {
  const route = useRoute();
  const session = useSession();

  const allowed = route !== "unknown" && canVisit(route, session);

  useEffect(() => {
    if (route === "unknown") return;
    if (!canVisit(route, session)) go(session ? "clock" : "threshold");
    else if (route !== "threshold" && route !== "about") markVisited(route);
  }, [route, session]);

  let screen = null;
  if (route === "unknown") screen = <NotFound />;
  else if (allowed) {
    if (route === "threshold") screen = <Threshold session={session} />;
    else if (route === "clock" && session) screen = <ActClock session={session} />;
    else if (route === "society" && session) screen = <ActSociety session={session} />;
    else if ((route === "energy" || route === "break") && session) {
      screen = <ActSim session={session} mode={route} />;
    } else if (route === "lifeline" && session) screen = <Lifeline session={session} />;
    else if (route === "about") screen = <About />;
  }

  return (
    <AppShell route={route === "unknown" ? "about" : route} session={session}>
      {screen}
    </AppShell>
  );
}

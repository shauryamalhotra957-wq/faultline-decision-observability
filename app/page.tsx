import type { Metadata } from "next";
import FaultlineApp from "./FaultlineApp";

export const metadata: Metadata = {
  title: "Control Room",
  description: "Decision observability for teams operating under uncertainty.",
};

export default function Home() {
  return <FaultlineApp />;
}

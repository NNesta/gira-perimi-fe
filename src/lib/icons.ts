import { createElement } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Flag,
  Footprints,
  Gauge,
  IdCard,
  Lightbulb,
  type LucideIcon,
  Road,
  Route,
  Scale,
  ShieldCheck,
  Siren,
  Split,
  SquareParking,
  TrafficCone,
  TriangleAlert,
  Truck,
} from "lucide-react";

// Icon names come from the API (lessons and topics); unknown names fall back to a book.
const ICONS: Record<string, LucideIcon> = {
  "arrow-left-right": ArrowLeftRight,
  "book-open": BookOpen,
  flag: Flag,
  footprints: Footprints,
  gauge: Gauge,
  "id-card": IdCard,
  lightbulb: Lightbulb,
  road: Road,
  route: Route,
  scale: Scale,
  "shield-check": ShieldCheck,
  siren: Siren,
  split: Split,
  "square-parking": SquareParking,
  "traffic-cone": TrafficCone,
  "triangle-alert": TriangleAlert,
  truck: Truck,
};

export function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}

/** Renders an icon chosen by name (from API data) without declaring a component during render. */
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  return createElement(iconFor(name), { className, "aria-hidden": true });
}

// A colour family per topic, used for chips, bars and practice cards.
export const TOPIC_TONES: Record<string, { chip: string; bar: string; soft: string }> = {
  ibyapa: { chip: "bg-signal-50 text-signal-700 ring-signal-200", bar: "bg-signal-500", soft: "from-signal-500/15" },
  ibimenyetso: { chip: "bg-sun-50 text-sun-700 ring-sun-200", bar: "bg-sun-400", soft: "from-sun-400/20" },
  "gutambuka-mbere": { chip: "bg-ocean-50 text-ocean-700 ring-ocean-200", bar: "bg-ocean-500", soft: "from-ocean-500/15" },
  kunyuranaho: { chip: "bg-brand-50 text-brand-700 ring-brand-200", bar: "bg-brand-500", soft: "from-brand-500/15" },
  umuvuduko: { chip: "bg-signal-50 text-signal-700 ring-signal-200", bar: "bg-signal-400", soft: "from-signal-400/15" },
  guhagarara: { chip: "bg-ocean-50 text-ocean-700 ring-ocean-200", bar: "bg-ocean-400", soft: "from-ocean-400/15" },
  amatara: { chip: "bg-sun-50 text-sun-700 ring-sun-200", bar: "bg-sun-500", soft: "from-sun-500/20" },
  ibinyabiziga: { chip: "bg-brand-50 text-brand-700 ring-brand-200", bar: "bg-brand-600", soft: "from-brand-600/15" },
  abagenzi: { chip: "bg-ocean-50 text-ocean-800 ring-ocean-200", bar: "bg-ocean-600", soft: "from-ocean-600/15" },
  imyitwarire: { chip: "bg-brand-50 text-brand-800 ring-brand-200", bar: "bg-brand-400", soft: "from-brand-400/15" },
};

export function topicTone(topic: string) {
  return TOPIC_TONES[topic] ?? TOPIC_TONES.imyitwarire;
}

import { BookOpen, ClipboardCheck, House, LayoutDashboard, Signpost, Target } from "lucide-react";

export const MAIN_NAV = [
  { href: "/amasomo", label: "Amasomo", icon: BookOpen },
  { href: "/ibyapa", label: "Ibyapa", icon: Signpost },
  { href: "/imyitozo", label: "Imyitozo", icon: Target },
  { href: "/ikizamini", label: "Ikizamini", icon: ClipboardCheck },
] as const;

export const MOBILE_NAV = [
  { href: "/", label: "Ahabanza", icon: House },
  { href: "/amasomo", label: "Amasomo", icon: BookOpen },
  { href: "/imyitozo", label: "Imyitozo", icon: Target },
  { href: "/ikizamini", label: "Ikizamini", icon: ClipboardCheck },
  { href: "/ikibaho", label: "Ikibaho", icon: LayoutDashboard },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

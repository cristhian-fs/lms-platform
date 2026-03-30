import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const links = [
  { to: "/", label: "Início" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export default function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8 md:border-x">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-sm tracking-tight text-foreground"
          >
            <GraduationCap className="size-5" aria-hidden="true" />
            LMS Platform
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{
                  className:
                    "rounded-md px-3 py-1.5 text-sm bg-accent text-accent-foreground font-medium",
                }}
                activeOptions={{ exact: to === "/" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: theme toggle + user */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

import { Toaster } from "@lms-platform/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";
import { TooltipProvider } from "@lms-platform/ui/components/tooltip";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { title: "LMS Platform" },
      { name: "description", content: "lms-platform is a web application" },
      {
        name: "theme-color",
        content: "#09090b",
        media: "(prefers-color-scheme: dark)",
      },
      {
        name: "theme-color",
        content: "#f8f8fc",
        media: "(prefers-color-scheme: light)",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <main id="main-content">
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
          </main>
        </div>
        <Toaster richColors />
      </ThemeProvider>
      {/* <TanStackRouterDevtools position="bottom-left" /> */}
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}

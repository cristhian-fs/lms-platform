import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@lms-platform/ui/components/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@lms-platform/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@lms-platform/ui/components/button-group";
import {
  FireExtinguisher,
  GraduationCap,
  Home,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { NavUser } from "./nav-user";
import { useQuery } from "@tanstack/react-query";
import { userQueryOptions } from "@/lib/auth-utils";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Comece agora",
      url: "#",
      items: [
        {
          title: "Home",
          url: "/dashboard",
          isActive: false,
          icon: Home,
        },
        {
          title: "Cursos",
          url: "/dashboard/courses",
          isActive: false,
          icon: GraduationCap,
        },
      ],
    },
  ],
  footer: [
    {
      title: "Configs",
      url: "#",
      items: [
        {
          title: "Configuracoes",
          url: "/dashboard/settings",
          isActive: false,
          icon: Settings,
        },
        {
          title: "Suporte",
          url: "/dashboard/support",
          isActive: false,
          icon: User,
        },
        {
          title: "O que tem de novo",
          url: "/dashboard/changelog",
          isActive: false,
          icon: FireExtinguisher,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useQuery(userQueryOptions());
  const { pathname } = useLocation();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Button
          asChild
          variant="ghost"
          className="text-left justify-start"
          size={"lg"}
        >
          <Link to="/">
            <GraduationCap className="size-5" aria-hidden="true" />
            LMS Platform
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                <ButtonGroup orientation="vertical" className="w-full">
                  {item.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuButton
                        key={item.url}
                        asChild
                        isActive={pathname === item.url}
                        variant={pathname === item.url ? "active" : "outline"}
                        size="lg"
                      >
                        <Link to={item.url}>
                          <Icon />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    );
                  })}
                </ButtonGroup>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="w-full">
        {data.footer.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                <ButtonGroup orientation="vertical" className="w-full">
                  {user?.role && user?.role.toLowerCase() === "admin" && (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/admin"}
                      variant={
                        pathname === "/dashboard/admin" ? "active" : "outline"
                      }
                      size="lg"
                    >
                      <Link to={"/dashboard/admin"}>
                        <ShieldCheck />
                        Painel admin
                      </Link>
                    </SidebarMenuButton>
                  )}

                  {item.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuButton
                        key={item.url}
                        asChild
                        isActive={pathname === item.url}
                        variant={pathname === item.url ? "active" : "outline"}
                        size="lg"
                      >
                        <Link to={item.url}>
                          <Icon />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    );
                  })}
                </ButtonGroup>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <NavUser
          user={{
            avatar: user?.image ?? "/placeholder.png",
            email: user?.email ?? "No email",
            name: user?.name ?? "No name",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

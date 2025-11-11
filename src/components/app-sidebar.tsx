"use client";

import {
  House,
  Sparkle,
  BookBookmark,
  Gear,
} from "@phosphor-icons/react/dist/ssr";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: House,
  },
  {
    title: "Crear Prompt",
    url: "/prompts/new",
    icon: Sparkle,
  },
  {
    title: "Mis Prompts",
    url: "/prompts",
    icon: BookBookmark,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Gear,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkle size={24} weight="fill" className="text-sidebar-primary" />
          <span className="font-bold text-lg">AI Prompts</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          La mejor plataforma de creación de prompts
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

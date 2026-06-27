"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Home,
  Compass,
  List,
  Search,
  User,
  LifeBuoy,
  Send,
  Frame,
  PieChart,
  Map,
  Terminal,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

import { useAuthStore } from "@/features/auth"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useLogout } from "@/features/auth/hooks/use-logout"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@recto/ui/components/sidebar"

import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp"
import rectoLogoDark from "@recto/assets/logos/recto-logo-dark.webp"
import rectoIconGold from "@recto/assets/logos/recto-icon-gold.webp"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logoutMutation = useLogout()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  useCurrentUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDarkMode = currentTheme === "dark"
  const logoSrc = !mounted
    ? rectoLogoLight
    : isDarkMode
      ? rectoLogoLight
      : rectoLogoDark

  // ... (mainItems mapping remains same)
  const mainItems = [
    {
      title: "Feed",
      url: "/feed",
      icon: <Home />,
      isActive: pathname === "/feed",
    },
    {
      title: "Browse",
      url: "/browse",
      icon: <Compass />,
      isActive: pathname === "/browse",
    },
    {
      title: "Lists",
      url: "/list",
      icon: <List />,
      isActive: pathname.startsWith("/list"),
    },
    {
      title: "Search",
      url: "/search",
      icon: <Search />,
      isActive: pathname === "/search",
    },
  ]

  if (isAuthenticated && user) {
    mainItems.push({
      title: "Profile",
      url: `/${user.userName}`,
      icon: <User />,
      isActive: pathname === `/${user.userName}`,
    })
  }

  const secondaryItems = [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoy />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <Send />,
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="flex items-center justify-start py-4 px-4 border-b border-sidebar-border">
        <Link href="/feed" className="flex items-center">
          {isCollapsed ? (
            <Image
              src={rectoIconGold}
              alt="Recto"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          ) : (
            <Image
              src={logoSrc}
              alt="Recto"
              width={112}
              height={32}
              className="h-6 w-auto object-contain"
              priority
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainItems} />
        <NavSecondary items={secondaryItems} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {isAuthenticated && user ? (
          <NavUser
            user={user}
            onLogout={() => logoutMutation.mutate()}
          />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/login">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <LogOut className="size-4 rotate-180" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Sign In</span>
                    <span className="truncate text-xs">Access your account</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

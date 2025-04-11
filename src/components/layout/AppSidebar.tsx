
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart4, Home, LineChart, List, PieChart, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: 'Dashboard', icon: Home, path: '/' },
    { title: 'Markets', icon: LineChart, path: '/markets' },
    { title: 'Portfolio', icon: PieChart, path: '/portfolio' },
    { title: 'Watchlist', icon: List, path: '/watchlist' },
    { title: 'Trading', icon: BarChart4, path: '/trading' },
    { title: 'Account', icon: User, path: '/account' },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart4 className="mr-2 h-6 w-6 text-primary" />
            MarketMaestro
          </h2>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={isActive(item.path) ? 'bg-sidebar-accent' : ''}>
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

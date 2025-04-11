
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { StockProvider } from '@/contexts/StockContext';

const AppLayout = () => {
  return (
    <StockProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-auto p-4">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </StockProvider>
  );
};

export default AppLayout;

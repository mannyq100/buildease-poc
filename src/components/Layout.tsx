import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <img src="/buildease-logo-2.svg" alt="BuildEase" className="h-20 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default Layout; 
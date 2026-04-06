import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Navbar() {
  const location = useLocation();

  if (location.pathname.startsWith('/session/')) {
    return null;
  }

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MedQSM</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === '/dashboard'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              to="/setup-session"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === '/setup-session'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              Nouveau test
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

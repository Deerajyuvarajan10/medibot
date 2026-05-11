import React from 'react';
import { Activity, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ModeToggle from './ModeToggle';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-background-primary flex items-center justify-between px-4 md:px-6 shrink-0 gap-2">
      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2 text-accent-primary">
          <Activity size={22} />
          <span className="text-lg font-heading font-semibold text-white hidden sm:inline">MediBot</span>
        </div>
      </div>

      {/* Centre: Mode toggle — scrollable on mobile */}
      <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
        <ModeToggle />
      </div>

      {/* Right: user + logout */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={16} />
            )}
          </div>
          <span className="truncate max-w-[100px] hidden md:inline">{user?.displayName || user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

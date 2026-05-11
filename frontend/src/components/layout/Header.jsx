import React from 'react';
import { Activity, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ModeToggle from './ModeToggle';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-background-primary flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-accent-primary md:w-64">
        <Activity size={24} />
        <span className="text-xl font-heading font-semibold text-white">MediBot</span>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center">
        <ModeToggle />
      </div>

      <div className="flex items-center justify-end gap-4 md:w-64">
        <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={16} />
            )}
          </div>
          <span className="truncate max-w-[120px]">{user?.displayName || user?.email}</span>
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

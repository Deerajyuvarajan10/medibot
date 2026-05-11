import React from 'react';
import { useMode, MODES } from '../../contexts/ModeContext';
import { MessageSquare, BookOpen, Stethoscope, ImageIcon } from 'lucide-react';

export default function ModeToggle() {
  const { currentMode, setMode } = useMode();

  const modes = [
    { id: MODES.GENERAL, icon: MessageSquare, label: 'General' },
    { id: MODES.MEDBOOKS, icon: BookOpen, label: 'Med Books' },
    { id: MODES.DOCTOR, icon: Stethoscope, label: 'Doctor' },
    { id: MODES.IMAGEGEN, icon: ImageIcon, label: 'Image Gen' },
  ];

  return (
    <div className="flex bg-background-card rounded-pill p-1 border border-white/10">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-pill text-sm font-medium transition-all duration-300 ${
              isActive 
                ? 'bg-accent-primary text-background-primary shadow-accent-glow' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            <span className="hidden lg:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

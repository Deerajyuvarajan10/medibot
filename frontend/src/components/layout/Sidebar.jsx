import React from 'react';
import { useMode, MODES } from '../../contexts/ModeContext';
import { PlusCircle, MessageSquare } from 'lucide-react';
import BookUploader from '../upload/BookUploader';

export default function Sidebar() {
  const { currentMode } = useMode();

  return (
    <aside className="w-64 bg-background-secondary border-r border-white/10 flex flex-col h-[calc(100vh-4rem)] hidden md:flex shrink-0">
      <div className="p-4 border-b border-white/10">
        <button className="btn btn-secondary w-full flex items-center justify-center gap-2 py-2.5">
          <PlusCircle size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {currentMode === MODES.MEDBOOKS ? (
          <BookUploader />
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Recent Chats</h3>
            {/* Placeholder for chat history */}
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <button key={i} className="w-full text-left px-3 py-2 rounded-medium hover:bg-white/5 text-sm text-text-primary flex items-center gap-3 transition-colors">
                  <MessageSquare size={16} className="text-text-secondary" />
                  <span className="truncate">Medical consultation {i}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useMode, MODES } from '../../contexts/ModeContext';
import { PlusCircle, MessageSquare, X } from 'lucide-react';
import BookUploader from '../upload/BookUploader';

const MAX_RECENT = 5;
const STORAGE_KEY = 'medibot_recent_chats';

const MODE_ICON = {
  [MODES.GENERAL]:  '💬',
  [MODES.MEDBOOKS]: '📚',
  [MODES.DOCTOR]:   '🩻',
  [MODES.IMAGEGEN]: '🎨',
};

export default function Sidebar({ onNewChat, currentChatId, onSelectChat, isMobileOpen, onMobileClose }) {
  const { currentMode, setMode } = useMode();
  const [recentChats, setRecentChats] = useState([]);

  // Load persisted chats
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecentChats(stored.slice(0, MAX_RECENT));
    } catch {
      setRecentChats([]);
    }
  }, []);

  // Register a new chat entry (called externally via ref or prop after first message)
  const registerChat = useCallback((id, label, mode) => {
    setRecentChats(prev => {
      if (prev.find(c => c.id === id)) return prev;
      const updated = [{ id, label, mode }, ...prev].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Expose registerChat to parent via a stable ref trick
  useEffect(() => {
    window.__medibotRegisterChat = registerChat;
  }, [registerChat]);

  const handleNewChat = () => {
    if (onNewChat) onNewChat();
    if (onMobileClose) onMobileClose();
  };

  const handleSelectChat = (chat) => {
    if (chat.mode && chat.mode !== currentMode) setMode(chat.mode);
    if (onSelectChat) onSelectChat(chat.id);
    if (onMobileClose) onMobileClose();
  };

  const removeChat = (e, id) => {
    e.stopPropagation();
    const updated = recentChats.filter(c => c.id !== id);
    setRecentChats(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const sidebarInner = (
    <aside className="w-64 bg-background-secondary border-r border-white/10 flex flex-col h-full shrink-0">
      {/* New Chat */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <button
          onClick={handleNewChat}
          className="btn btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
        >
          <PlusCircle size={17} />
          New Chat
        </button>
        {onMobileClose && (
          <button onClick={onMobileClose} className="p-2 text-text-secondary hover:text-white md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Med Books uploader (shown in Med Books mode at top) */}
      {currentMode === MODES.MEDBOOKS && (
        <div className="p-4 border-b border-white/10">
          <BookUploader />
        </div>
      )}

      {/* Recent Chats — shown in ALL modes */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Recent Chats
          {recentChats.length > 0 && (
            <span className="ml-1 opacity-50">({recentChats.length}/{MAX_RECENT})</span>
          )}
        </h3>

        {recentChats.length === 0 ? (
          <p className="text-xs text-text-secondary/60 italic mt-1">
            No chats yet. Start a conversation!
          </p>
        ) : (
          <div className="space-y-1">
            {recentChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full text-left px-3 py-2 rounded-medium text-sm flex items-center gap-2 transition-colors group ${
                  currentChatId === chat.id
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="text-base shrink-0">{MODE_ICON[chat.mode] || '💬'}</span>
                <span className="truncate flex-1 text-xs">{chat.label}</span>
                <span
                  role="button"
                  onClick={(e) => removeChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-danger p-0.5 transition-all cursor-pointer shrink-0"
                >
                  <X size={11} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-full">{sidebarInner}</div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="w-72 h-full">{sidebarInner}</div>
        </div>
      )}
    </>
  );
}

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useMode, MODES } from '../contexts/ModeContext';

const MODE_LABEL = {
  [MODES.GENERAL]:  '💬 General',
  [MODES.MEDBOOKS]: '📚 Med Books',
  [MODES.DOCTOR]:   '🩻 Doctor',
  [MODES.IMAGEGEN]: '🎨 Image Gen',
};

export default function Chat() {
  const { currentMode } = useMode();
  const [chatId, setChatId] = useState(() => Date.now().toString());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const registeredRef = useRef(false); // track if current chatId has been registered

  // Reset registration flag when chatId changes (new chat)
  useEffect(() => {
    registeredRef.current = false;
  }, [chatId]);

  // Register the first message into recent chats list
  const handleFirstMessage = useCallback(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;
    const label = `${MODE_LABEL[currentMode] || 'Chat'} — ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    window.__medibotRegisterChat?.(chatId, label, currentMode);
  }, [chatId, currentMode]);

  const handleNewChat = useCallback(() => {
    setChatId(Date.now().toString());
    setIsMobileOpen(false);
  }, []);

  const handleSelectChat = useCallback((id) => {
    setChatId(id);
    setIsMobileOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-primary text-text-primary">
      <Header onMenuClick={() => setIsMobileOpen(prev => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewChat={handleNewChat}
          currentChatId={chatId}
          onSelectChat={handleSelectChat}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <ChatWindow
            chatId={chatId}
            onFirstMessage={handleFirstMessage}
          />
        </main>
      </div>
    </div>
  );
}

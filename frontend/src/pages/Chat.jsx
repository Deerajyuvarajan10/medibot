import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function Chat() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-primary text-text-primary">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col relative">
          <ChatWindow />
        </main>
      </div>
    </div>
  );
}

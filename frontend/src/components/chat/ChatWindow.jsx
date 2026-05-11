import React, { useState, useEffect, useRef } from 'react';
import { useMode, MODES } from '../../contexts/ModeContext';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import api from '../../services/api';
import { generateMedicalImage } from '../../services/imageGen';
import { toast } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export default function ChatWindow() {
  const { currentMode } = useMode();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Clear messages on mode switch
  useEffect(() => {
    setMessages([]);
  }, [currentMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text, file = null) => {
    if (!text && !file) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl: file ? URL.createObjectURL(file) : null
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let botResponse = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };

      if (currentMode === MODES.GENERAL) {
        const history = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
        const res = await api.post('/chat/general', { message: text, conversationHistory: history });
        botResponse.content = res.data.reply;
      } 
      else if (currentMode === MODES.DOCTOR) {
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('question', text || '');
          const res = await api.post('/doctor/analyze-image', formData);
          botResponse.content = res.data.analysis;
        } else {
          const history = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
          const res = await api.post('/doctor/chat', { message: text, conversationHistory: history });
          botResponse.content = res.data.reply;
        }
      }
      else if (currentMode === MODES.MEDBOOKS) {
        const res = await api.post('/rag/query', { message: text });
        botResponse.content = res.data.reply;
        if (res.data.sources) {
          botResponse.metadata = { ragSources: res.data.sources };
        }
      }
      else if (currentMode === MODES.IMAGEGEN) {
        const res = await api.post('/imagegen/generate', { prompt: text });
        botResponse.content = `Here is your generated medical illustration:\n\n*Enhanced prompt: ${res.data.enhancedPrompt}*`;
        botResponse.imageUrl = res.data.imageUrl;
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      toast.error('Failed to get response: ' + (err.response?.data?.error || err.message));
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'I encountered an error while processing your request. Please try again.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-primary relative">
      {currentMode === MODES.DOCTOR && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-warning/20 border-b border-warning/50 text-warning px-4 py-2 text-xs md:text-sm flex items-center justify-center gap-2 backdrop-blur-md">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="text-center font-medium">Doctor Mode is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.</span>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar ${currentMode === MODES.DOCTOR ? 'pt-14' : ''}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
            <h3 className="text-2xl font-heading mb-2">Welcome to MediBot</h3>
            <p>Start a conversation below.</p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        
        {isTyping && (
          <div className="flex gap-4 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center shrink-0">
              <span className="text-background-primary font-bold text-xs">AI</span>
            </div>
            <div className="bg-background-card border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1 h-12">
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-background-primary shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} mode={currentMode} />
        </div>
      </div>
    </div>
  );
}

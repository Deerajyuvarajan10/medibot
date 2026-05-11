import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMode, MODES } from '../../contexts/ModeContext';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Sparkles } from 'lucide-react';

const WELCOME = {
  [MODES.GENERAL]:  { icon: '🩺', title: 'General Medical Chat', sub: 'Ask any medical question and get evidence-based answers.' },
  [MODES.MEDBOOKS]: { icon: '📚', title: 'Med Books Mode', sub: 'Upload a textbook in the sidebar, then ask questions from it.' },
  [MODES.DOCTOR]:   { icon: '🩻', title: 'Doctor Mode', sub: 'Describe symptoms or upload an image for AI-powered analysis.' },
  [MODES.IMAGEGEN]: { icon: '🎨', title: 'Image Generator', sub: "Describe a medical illustration and I'll generate it for you, or upload a reference image." },
};

// Global history store: chatId -> messages[]
// (persists across re-renders but resets on full page reload — good enough for session)
const chatHistory = {};

export default function ChatWindow({ chatId, onFirstMessage }) {
  const { currentMode } = useMode();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Restore messages when chatId changes (clicking a recent chat)
  useEffect(() => {
    if (!chatId) return;
    setMessages(chatHistory[chatId] || []);
  }, [chatId]);

  // Save messages to history on every update
  useEffect(() => {
    if (chatId) {
      chatHistory[chatId] = messages;
    }
  }, [messages, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async (text, file = null) => {
    if (!text && !file) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl: file ? URL.createObjectURL(file) : null,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let botResponse = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };

      if (currentMode === MODES.GENERAL) {
        const history = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        }));
        const res = await api.post('/chat/general', { message: text, conversationHistory: history });
        botResponse.content = res.data.reply;

      } else if (currentMode === MODES.DOCTOR) {
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('question', text || '');
          const res = await api.post('/doctor/analyze-image', formData);
          botResponse.content = res.data.analysis;
        } else {
          const history = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }],
          }));
          const res = await api.post('/doctor/chat', { message: text, conversationHistory: history });
          botResponse.content = res.data.reply;
        }

      } else if (currentMode === MODES.MEDBOOKS) {
        const res = await api.post('/rag/query', { message: text });
        botResponse.content = res.data.answer || res.data.reply;
        if (res.data.sources) botResponse.metadata = { ragSources: res.data.sources };

      } else if (currentMode === MODES.IMAGEGEN) {
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('question', text || 'Describe this medical image in detail');
          const res = await api.post('/doctor/analyze-image', formData);
          botResponse.content = res.data.analysis;
          botResponse.imageUrl = URL.createObjectURL(file);
        } else {
          const res = await api.post('/imagegen/generate', { prompt: text });
          botResponse.content = `Here is your generated medical illustration:\n\n*Prompt: ${res.data.enhancedPrompt}*`;
          botResponse.imageUrl = res.data.imageUrl;
        }
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      toast.error('Failed to get response: ' + (err.response?.data?.error || err.message));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I encountered an error while processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [currentMode, messages]);

  const welcome = WELCOME[currentMode] || WELCOME[MODES.GENERAL];
  const showDoctorBanner = currentMode === MODES.DOCTOR;
  const showImageGenBanner = currentMode === MODES.IMAGEGEN;

  return (
    <div className="flex flex-col h-full bg-background-primary relative">
      {/* Doctor disclaimer */}
      {showDoctorBanner && (
        <div className="flex-none bg-warning/20 border-b border-warning/50 text-warning px-4 py-2 text-xs flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span className="text-center font-medium">
            Doctor Mode is for informational purposes only. Always consult a qualified healthcare provider.
          </span>
        </div>
      )}

      {/* Image gen hint */}
      {showImageGenBanner && (
        <div className="flex-none bg-accent-secondary/20 border-b border-accent-secondary/30 text-accent-secondary px-4 py-2 text-xs flex items-center justify-center gap-2">
          <Sparkles size={13} className="shrink-0" />
          <span>Describe a medical illustration <strong>or</strong> attach an image to analyse it</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-70 px-4">
            <span className="text-5xl">{welcome.icon}</span>
            <h3 className="text-2xl font-heading text-text-primary">{welcome.title}</h3>
            <p className="text-text-secondary max-w-sm text-sm">{welcome.sub}</p>
            {currentMode === MODES.IMAGEGEN && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center max-w-md">
                {['Anatomy of the heart', 'Cross-section of a neuron', 'DNA double helix', 'Human kidney structure'].map(p => (
                  <button
                    key={p}
                    onClick={() => handleSendMessage(p)}
                    className="px-3 py-1.5 rounded-pill bg-background-card border border-white/10 text-sm text-text-secondary hover:text-white hover:border-accent-primary transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}

        {isTyping && (
          <div className="flex gap-4 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center shrink-0">
              <span className="text-background-primary font-bold text-xs">AI</span>
            </div>
            <div className="bg-background-card border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1 h-12">
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot" />
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot" />
              <div className="w-2 h-2 rounded-full bg-text-secondary typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 md:p-4 border-t border-white/10 bg-background-primary shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} mode={currentMode} />
        </div>
      </div>
    </div>
  );
}

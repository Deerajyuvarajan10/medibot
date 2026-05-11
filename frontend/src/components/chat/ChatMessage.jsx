import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useVoice } from '../../hooks/useVoice';

export default function ChatMessage({ message }) {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const { speak, stopSpeaking, isSpeaking } = useVoice({});

  return (
    <div className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isUser ? 'bg-accent-secondary/20 text-accent-secondary' : 'bg-accent-primary text-background-primary'}`}>
        {isUser ? (
          user?.photoURL ? <img src={user.photoURL} alt="User" /> : <User size={16} />
        ) : (
          <span className="font-bold text-xs">AI</span>
        )}
      </div>

      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-tr-sm' 
              : 'bg-background-card border border-white/10 rounded-tl-sm text-text-primary'
          }`}
        >
          {message.content && (
            <div className="prose prose-invert max-w-none text-sm md:text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {message.imageUrl && (
            <div className="mt-4 relative group rounded-lg overflow-hidden border border-white/10">
              <img src={message.imageUrl} alt="Generated or Uploaded" className="max-w-full h-auto" />
              {!isUser && (
                <a 
                  href={message.imageUrl} 
                  download="medibot-image.png" 
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 p-2 bg-background-primary/80 backdrop-blur rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} />
                </a>
              )}
            </div>
          )}

          {message.metadata?.ragSources && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-text-secondary">
              <span className="font-semibold block mb-1">Sources:</span>
              <ul className="list-disc pl-4 space-y-1">
                {message.metadata.ragSources.map((s, i) => (
                  <li key={i}>{s.bookName} (Match: {(s.similarity * 100).toFixed(1)}%)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Simple voice playback button for AI messages */}
        {!isUser && message.content && (
          <button 
            onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
            className="text-xs text-text-secondary hover:text-accent-primary"
          >
            {isSpeaking ? 'Stop playing' : 'Play text audio'}
          </button>
        )}
      </div>
    </div>
  );
}

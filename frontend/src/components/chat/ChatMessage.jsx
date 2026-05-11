import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Download, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useVoice } from '../../hooks/useVoice';

export default function ChatMessage({ message }) {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const { speak, stopSpeaking, isSpeaking } = useVoice({});

  return (
    <div className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
        isUser ? 'bg-accent-secondary/20 text-accent-secondary' : 'bg-accent-primary text-background-primary'
      }`}>
        {isUser ? (
          user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <User size={16} />
        ) : (
          <span className="font-bold text-xs">AI</span>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
        <div className={`p-4 rounded-2xl max-w-full ${
          isUser
            ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-tr-sm'
            : 'bg-background-card border border-white/10 rounded-tl-sm text-text-primary'
        }`}>
          {/* Text content */}
          {message.content && (
            <div className="prose prose-invert max-w-none text-sm md:text-base break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Image — renders inline, no new tab */}
          {message.imageUrl && (
            <div className="mt-3 relative group rounded-xl overflow-hidden border border-white/10">
              <img
                src={message.imageUrl}
                alt="Medical illustration"
                className="w-full h-auto max-h-[480px] object-contain bg-black/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if image fails */}
              <div
                className="hidden items-center justify-center p-6 text-text-secondary text-sm"
              >
                Image could not be loaded. <a href={message.imageUrl} target="_blank" rel="noreferrer" className="ml-1 text-accent-primary underline">Open link</a>
              </div>

              {/* Download button overlay */}
              {!isUser && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={message.imageUrl}
                    download="medibot-illustration.png"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-background-primary/80 backdrop-blur rounded-full text-white hover:text-accent-primary transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </a>
                  <a
                    href={message.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-background-primary/80 backdrop-blur rounded-full text-white hover:text-accent-primary transition-colors"
                    title="Open full size"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* RAG sources */}
          {message.metadata?.ragSources && (
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-text-secondary">
              <span className="font-semibold block mb-1 text-text-secondary/80">📚 Sources:</span>
              <ul className="list-disc pl-4 space-y-1">
                {message.metadata.ragSources.map((s, i) => (
                  <li key={i}>{s.bookName} — {(s.similarity * 100).toFixed(1)}% match</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* TTS button — only for AI messages with text */}
        {!isUser && message.content && (
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all ${
              isSpeaking
                ? 'text-danger bg-danger/10 hover:bg-danger/20'
                : 'text-text-secondary hover:text-accent-primary hover:bg-white/5'
            }`}
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isSpeaking ? 'Stop audio' : 'Play audio'}
          </button>
        )}
      </div>
    </div>
  );
}

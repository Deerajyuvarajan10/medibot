import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { MODES } from '../../contexts/ModeContext';

export default function ChatInput({ onSend, disabled, mode }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const { isListening, startListening, stopListening } = useVoice({
    onTranscript: (transcript) => setText(prev => prev ? `${prev} ${transcript}` : transcript)
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    
    onSend(text.trim(), file);
    setText('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
    } else if (selected) {
      alert('Please select an image file.');
    }
    e.target.value = '';
  };

  const showAttachment = mode === MODES.DOCTOR;

  return (
    <form onSubmit={handleSubmit} className="relative">
      {file && (
        <div className="absolute bottom-full mb-2 left-0 right-0 p-2 bg-background-card border border-white/10 rounded-medium flex items-center gap-2">
          <img src={URL.createObjectURL(file)} alt="Preview" className="h-12 w-12 object-cover rounded" />
          <span className="text-sm truncate flex-1">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="p-1 hover:text-danger transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-background-secondary border border-white/10 rounded-2xl p-2 focus-within:border-accent-primary focus-within:ring-1 focus-within:ring-accent-primary transition-all">
        {showAttachment && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-text-secondary hover:text-accent-primary transition-colors shrink-0"
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          disabled={disabled}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[150px] py-3 px-2 text-text-primary placeholder-text-secondary"
          rows={1}
        />

        <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-danger/20 text-danger animate-pulse' 
                : 'text-text-secondary hover:bg-white/5 hover:text-accent-primary'
            }`}
            disabled={disabled}
          >
            {isListening ? (
              <div className="flex items-end justify-center gap-0.5 h-5 w-5">
                <div className="w-1 bg-danger wave-bar"></div>
                <div className="w-1 bg-danger wave-bar"></div>
                <div className="w-1 bg-danger wave-bar"></div>
              </div>
            ) : (
              <Mic size={20} />
            )}
          </button>
          
          <button
            type="submit"
            disabled={disabled || (!text.trim() && !file)}
            className="p-2 bg-accent-primary text-background-primary rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}

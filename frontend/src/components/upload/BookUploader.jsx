import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'medibot_books';

export default function BookUploader() {
  const [uploading, setUploading] = useState(false);
  const [books, setBooks] = useState([]);
  const { user } = useAuth();

  // Load books from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Only load books for this user
      setBooks(stored.filter(b => b.userId === user?.uid));
    } catch {
      setBooks([]);
    }
  }, [user?.uid]);

  const saveBooks = (updated) => {
    // Merge with other users' books
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const otherBooks = stored.filter(b => b.userId !== user?.uid);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherBooks, ...updated]));
    } catch {}
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF file');

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      formData.append('bookName', file.name.replace('.pdf', ''));

      toast.loading('Uploading & indexing book… This may take a minute.', { id: 'upload' });
      const res = await api.post('/upload/book', formData);
      toast.success(res.data.message || 'Book indexed successfully!', { id: 'upload' });

      const newBook = {
        id: res.data.bookId || Date.now().toString(),
        name: file.name.replace('.pdf', ''),
        fileName: file.name,
        userId: user.uid,
        uploadedAt: new Date().toISOString(),
        chunkCount: res.data.chunkCount,
      };
      const updated = [...books, newBook];
      setBooks(updated);
      saveBooks(updated);
    } catch (err) {
      toast.error('Failed to upload: ' + (err.response?.data?.error || err.message), { id: 'upload' });
    } finally {
      setUploading(false);
    }
  }, [user, books]);

  const removeBook = (id) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveBooks(updated);
    toast.success('Book removed from list');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Upload Textbook</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-large p-5 text-center cursor-pointer transition-all ${
            uploading ? 'opacity-60 pointer-events-none' :
            isDragActive ? 'border-accent-primary bg-accent-primary/5 scale-[1.02]' :
            'border-white/10 hover:border-accent-primary/50 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader className="animate-spin text-accent-primary" size={24} />
            ) : (
              <UploadCloud className="text-text-secondary" size={28} />
            )}
            <p className="text-sm text-text-secondary leading-snug">
              {uploading
                ? 'Indexing…'
                : isDragActive
                ? 'Drop PDF here'
                : 'Drag & drop or click to browse'}
            </p>
            {!uploading && <p className="text-xs text-text-secondary/50">PDF files only</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Your Books {books.length > 0 && <span className="text-text-secondary/50">({books.length})</span>}
        </h3>
        {books.length === 0 ? (
          <p className="text-xs text-text-secondary/60 italic">No books yet. Upload a PDF to get started.</p>
        ) : (
          <div className="space-y-2">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-2 p-3 bg-background-card rounded-medium border border-white/5 group"
              >
                <FileText className="text-accent-primary shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{book.name}</p>
                  {book.chunkCount && (
                    <p className="text-xs text-text-secondary/60">{book.chunkCount} chunks indexed</p>
                  )}
                </div>
                <button
                  onClick={() => removeBook(book.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-danger transition-all"
                  title="Remove book"
                >
                  <Trash2 size={13} />
                </button>
                <CheckCircle className="text-success shrink-0" size={14} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

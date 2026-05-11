import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function BookUploader() {
  const [uploading, setUploading] = useState(false);
  const [books, setBooks] = useState([]); // In a real app, fetch this from Firestore
  const { user } = useAuth();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return toast.error('Please upload a PDF file');
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      formData.append('bookName', file.name.replace('.pdf', ''));

      const res = await api.post('/upload/book', formData);
      toast.success(res.data.message || 'Book uploaded successfully!');
      
      setBooks(prev => [...prev, { name: file.name, id: res.data.bookId }]);
    } catch (err) {
      toast.error('Failed to upload book: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Upload Textbook</h3>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-large p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-accent-primary bg-accent-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader className="animate-spin text-accent-primary" size={24} />
            ) : (
              <UploadCloud className="text-text-secondary" size={24} />
            )}
            <p className="text-sm text-text-secondary">
              {uploading ? 'Uploading & Indexing...' : isDragActive ? 'Drop PDF here' : 'Drag PDF or click to browse'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Your Books</h3>
        {books.length === 0 ? (
          <p className="text-sm text-text-secondary italic">No books uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {books.map((book, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-background-card rounded-medium border border-white/5">
                <FileText className="text-accent-primary shrink-0" size={16} />
                <span className="text-sm text-text-primary truncate flex-1">{book.name}</span>
                <CheckCircle className="text-success shrink-0" size={14} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

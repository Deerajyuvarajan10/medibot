import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import Home from './pages/Home';
import Chat from './pages/Chat';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <div className="min-h-screen bg-background-primary text-text-primary font-body">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A2235',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
        </div>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Stethoscope, ImageIcon, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-background-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-accent-primary">
          <Activity size={28} />
          <h1 className="text-2xl font-heading font-semibold tracking-tight text-white">MediBot</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-text-secondary hover:text-white transition-colors">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium border border-accent-primary/20 mb-4">
            <ShieldCheck size={16} />
            <span>AI-Powered Medical Assistant</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight">
            Your personal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              health intelligence
            </span>
          </h2>
          
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Experience the future of medical information. MediBot combines advanced AI with medical knowledge to provide insights, analyze symptoms, and study textbooks.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto">
              See How It Works
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto w-full text-left">
          <FeatureCard 
            icon={<Stethoscope className="text-accent-secondary" size={32} />}
            title="Doctor Mode"
            desc="Symptom analysis and image recognition with robust medical disclaimers."
          />
          <FeatureCard 
            icon={<BookOpen className="text-accent-primary" size={32} />}
            title="Med Books RAG"
            desc="Upload your medical textbooks and ask context-aware questions instantly."
          />
          <FeatureCard 
            icon={<ImageIcon className="text-warning" size={32} />}
            title="Medical Imaging"
            desc="Generate high-quality anatomical diagrams and medical illustrations."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-text-secondary border-t border-white/10 mt-auto">
        <p>© {new Date().getFullYear()} MediBot. Educational purposes only. Not medical advice.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card hover:border-accent-primary/50 hover:shadow-accent-glow transition-all duration-300">
      <div className="mb-4 bg-background-secondary w-14 h-14 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-semibold text-white mb-2">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

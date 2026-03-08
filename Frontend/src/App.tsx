import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import { getCurrentUser, setCurrentUser, UserProfile } from './lib/store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import kardiokuLogoHati from '@/assets/kardio_logo.png';

const queryClient = new QueryClient();

type AppScreen = 'auth' | 'onboarding' | 'dashboard';

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('kardioku_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const [screen, setScreen] = useState<AppScreen>('auth');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      if (!current.umur || current.umur === 0) {
        setCurrentUser(null);
        setUser(null);
        setScreen('auth');
      } else {
        setUser(current);
        setScreen('dashboard');
      }
    } else {
      setScreen('auth');
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleAuthenticated = () => {
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      if (!current.umur || current.umur === 0) {
        setScreen('onboarding');
      } else {
        setScreen('dashboard');
      }
    }
  };

  const handleOnboardingComplete = (updated: UserProfile) => {
    setUser(updated);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setScreen('auth');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {showSplash ? (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary">
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] overflow-hidden shadow-2xl border border-primary/20 bg-background flex items-center justify-center mb-6">
                <img src={kardiokuLogoHati} alt="Kardioku Logo" className="w-full h-full object-cover animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                <span className="text-[#0c82a3]">Kardio</span>
                <span className="text-[#ff4b6a]">ku</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0c82a3] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#ff4b6a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#0c82a3] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {screen === 'auth' && (
              <Auth onAuthenticated={handleAuthenticated} />
            )}
            {/* Mengirimkan fungsi handleLogout ke Onboarding sebagai 'onCancel' */}
            {screen === 'onboarding' && user && (
              <Onboarding user={user} onComplete={handleOnboardingComplete} onCancel={handleLogout} />
            )}
            {screen === 'dashboard' && user && (
              <Dashboard user={user} onLogout={handleLogout} />
            )}
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
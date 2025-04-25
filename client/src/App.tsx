import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import JobSearch from "@/pages/JobSearch";
import ApplicationHistory from "@/pages/ApplicationHistory";
import ResumeManager from "@/pages/ResumeManager";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        const data = await res.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user || null);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Mock login for demo purposes - in a real app, this would use the actual login API
  const handleLogin = async () => {
    try {
      await apiRequest('POST', '/api/auth/login', { 
        username: 'testuser', 
        password: 'password123' 
      });
      
      const res = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user || null);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">JobApplyAI</h1>
            </div>
            <h2 className="text-xl font-semibold">Welcome to JobApplyAI</h2>
            <p className="text-sm text-muted-foreground mt-2">Sign in to access your job application assistant</p>
          </div>
          
          <div className="bg-card rounded-lg shadow-md border border-border p-6">
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Sign in with Demo Account
            </button>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>For demonstration purposes, this app uses a pre-configured demo account.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar user={user} />
        <main className="flex-1 bg-secondary">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/job-search" component={JobSearch} />
            <Route path="/application-history" component={ApplicationHistory} />
            <Route path="/resume-manager" component={ResumeManager} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

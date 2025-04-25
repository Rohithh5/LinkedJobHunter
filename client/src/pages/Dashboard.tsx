import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import LinkedInConnect from "@/components/LinkedInConnect";
import StatsCard from "@/components/StatsCard";
import ApplicationActivity from "@/components/ApplicationActivity";
import RecommendedJobs from "@/components/RecommendedJobs";
import QuickApply from "@/components/QuickApply";
import JobSearchModal from "@/components/JobSearchModal";
import { apiRequest } from "@/lib/queryClient";

const Dashboard = () => {
  const [user, setUser] = useState<any>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch application statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Handle LinkedIn connection
  const handleLinkedInConnect = async () => {
    try {
      await apiRequest('GET', '/api/linkedin/callback', undefined);
      
      // Refresh user data after connection
      const res = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
    }
  };

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}`}
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        {/* LinkedIn Connect Section (only if not connected) */}
        {user && !user.linkedinConnected && (
          <LinkedInConnect 
            isConnected={!!user.linkedinConnected} 
            onConnect={handleLinkedInConnect}
          />
        )}
        
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Total Applications" 
            value={statsLoading ? "-" : stats?.totalApplications || 0} 
            icon="paper-plane"
            change={{ value: 12, trend: "up" }}
          />
          <StatsCard 
            title="Responses Received" 
            value={statsLoading ? "-" : stats?.responsesReceived || 0} 
            icon="reply"
            change={{ value: 5, trend: "up" }}
          />
          <StatsCard 
            title="Interviews Scheduled" 
            value={statsLoading ? "-" : stats?.interviewsScheduled || 0} 
            icon="calendar-check"
            change={{ value: 2, trend: "up" }}
          />
          <StatsCard 
            title="Success Rate" 
            value={statsLoading ? "-" : stats?.successRate || 0} 
            icon="chart-line"
            change={{ value: 3, trend: "up" }}
          />
        </div>
        
        {/* Application Activity and Recommended Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ApplicationActivity />
          </div>
          
          {/* Recommended Jobs */}
          <div className="lg:col-span-1">
            <RecommendedJobs />
          </div>
        </div>
        
        {/* Quick Apply Section */}
        <QuickApply 
          isConnected={!!user.linkedinConnected} 
          onSearchClick={() => setShowSearchModal(true)}
        />
      </div>
      
      {/* Job Search Modal */}
      <JobSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
};

export default Dashboard;

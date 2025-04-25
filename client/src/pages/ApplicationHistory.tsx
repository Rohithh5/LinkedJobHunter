import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const ApplicationHistory = () => {
  const [user, setUser] = useState<any>({
    fullName: "User"
  });
  
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

  // Query all applications
  const { data: allApplications, isLoading } = useQuery({
    queryKey: ['/api/applications'],
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  // Get applications by status
  const getApplicationsByStatus = (status?: string) => {
    if (!allApplications) return [];
    if (!status) return allApplications;
    
    return allApplications.filter((app: any) => app.application.status === status);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    let color;
    let label;
    
    switch (status) {
      case 'applied':
        color = 'bg-blue-100 text-blue-800';
        label = 'Applied';
        break;
      case 'in_review':
        color = 'bg-yellow-100 text-yellow-800';
        label = 'In Review';
        break;
      case 'viewed':
        color = 'bg-green-100 text-green-800';
        label = 'Viewed';
        break;
      case 'interview_scheduled':
        color = 'bg-green-500 text-white';
        label = 'Interview Scheduled';
        break;
      case 'rejected':
        color = 'bg-red-100 text-red-800';
        label = 'Not Selected';
        break;
      case 'no_response':
        color = 'bg-gray-100 text-gray-800';
        label = 'No Response';
        break;
      case 'hired':
        color = 'bg-purple-100 text-purple-800';
        label = 'Hired';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        label = status;
    }
    
    return <Badge className={cn("font-normal", color)}>{label}</Badge>;
  };

  // Application count for tabs
  const getTabCount = (status?: string) => {
    if (!allApplications) return 0;
    if (!status) return allApplications.length;
    
    return allApplications.filter((app: any) => app.application.status === status).length;
  };

  return (
    <div>
      <Header 
        title="Application History" 
        subtitle="Track and manage your job applications"
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-lg border border-border/20 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">My Applications</h3>
            <p className="text-sm text-muted-foreground">
              Track the status of your job applications and follow up as needed
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">{getTabCount()}</span>
                </TabsTrigger>
                <TabsTrigger value="in_review">
                  In Review <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">{getTabCount('in_review')}</span>
                </TabsTrigger>
                <TabsTrigger value="interview_scheduled">
                  Interviews <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">{getTabCount('interview_scheduled')}</span>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">{getTabCount('rejected')}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {renderApplications(getApplicationsByStatus())}
              </TabsContent>
              
              <TabsContent value="in_review" className="space-y-4">
                {renderApplications(getApplicationsByStatus('in_review'))}
              </TabsContent>
              
              <TabsContent value="interview_scheduled" className="space-y-4">
                {renderApplications(getApplicationsByStatus('interview_scheduled'))}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {renderApplications(getApplicationsByStatus('rejected'))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );

  function renderApplications(applications: any[]) {
    if (!applications || applications.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-lg font-medium mb-2">No applications found</h4>
          <p>You haven't applied to any jobs in this category yet.</p>
        </div>
      );
    }
    
    return applications.map((app: any) => (
      <div key={app.application.id} className="border border-border/10 rounded-lg p-5 hover:border-accent/20 transition-colors">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-foreground">{app.job.title}</h4>
            <p className="text-muted-foreground">{app.company.name}</p>
          </div>
          <div className="mt-2 md:mt-0">
            {getStatusBadge(app.application.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Applied On</p>
            <p className="text-foreground">{formatDate(app.application.applicationDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-foreground">{formatDate(app.application.lastStatusUpdate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-foreground">{app.job.location}</p>
          </div>
        </div>
        
        {app.application.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-foreground text-sm">{app.application.notes}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/10">
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {app.resume ? app.resume.title : "No resume attached"}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href={app.job.url} target="_blank" rel="noopener noreferrer">
                View Job
              </a>
            </Button>
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </div>
        </div>
      </div>
    ));
  }
};

export default ApplicationHistory;

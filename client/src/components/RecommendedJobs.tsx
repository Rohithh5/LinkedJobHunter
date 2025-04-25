import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const RecommendedJobs = () => {
  const [isApplying, setIsApplying] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['/api/recommended-jobs'],
  });

  const handleApply = async (jobId: number) => {
    if (isApplying[jobId]) return;

    setIsApplying(prev => ({ ...prev, [jobId]: true }));
    
    try {
      await apiRequest('POST', '/api/apply', { jobId });
      
      toast({
        title: "Successfully Applied",
        description: "Your application has been submitted.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/recommended-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-border/20 p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-foreground">Recommended Jobs</h3>
          <span className="text-accent text-sm">Loading...</span>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border/10 rounded-lg p-3">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center mr-3 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary animate-pulse rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-secondary animate-pulse rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-border/20 p-4">
        <div className="text-center py-8">
          <p className="text-destructive">Error loading recommended jobs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border/20 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-foreground">Recommended Jobs</h3>
        <a href="/job-search" className="text-accent text-sm hover:underline">See More</a>
      </div>
      
      <div className="space-y-3">
        {jobs && jobs.length > 0 ? (
          jobs.map((item: any) => (
            <div key={item.job.id} className="job-card border border-border/10 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center mr-3">
                  <span className="font-bold text-foreground">
                    {item.company?.name ? item.company.name.charAt(0) : "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{item.job.title}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{item.company?.name}</p>
                  <div className="text-xs text-muted-foreground/80 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{item.job.location}</span>
                    <span className="mx-2">•</span>
                    <span>{item.job.salary}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/10 flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                    {item.job.jobType?.replace('_', '-') || 'Full-time'}
                  </span>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                    {item.job.experienceLevel?.charAt(0).toUpperCase() + item.job.experienceLevel?.slice(1) || 'Senior'}
                  </span>
                </div>
                <button 
                  className="text-accent hover:text-accent/80 text-sm flex items-center"
                  onClick={() => handleApply(item.job.id)}
                  disabled={isApplying[item.job.id]}
                >
                  {isApplying[item.job.id] ? (
                    <>
                      <span className="animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full mr-1"></span>
                      Applying...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Easy Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recommended jobs at the moment. Complete your profile to get personalized recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;

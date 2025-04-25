import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const JobSearch = () => {
  const [user, setUser] = useState<any>({
    fullName: "User"
  });
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    experienceLevel: "",
    jobType: "",
    datePosted: "",
    page: 1,
    limit: 10
  });
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();

  // Fetch user data
  useState(() => {
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
  });

  // Query jobs with filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/jobs', { ...filters }],
  });

  const handleSearch = async () => {
    setSearching(true);
    try {
      await refetch();
    } finally {
      setSearching(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleApply = async (jobId: number) => {
    if (applying[jobId]) return;

    setApplying(prev => ({ ...prev, [jobId]: true }));
    
    try {
      await apiRequest('POST', '/api/apply', { jobId });
      
      toast({
        title: "Successfully Applied",
        description: "Your application has been submitted.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/applications/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const jobs = data || [];
  const totalPages = Math.ceil((jobs.length || 0) / filters.limit);

  return (
    <div>
      <Header 
        title="Job Search" 
        subtitle="Find and apply to jobs that match your skills"
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        {/* Search Filters */}
        <div className="bg-white rounded-lg border border-border/20 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Search Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <Input 
                placeholder="Frontend Developer, UX Designer..." 
                value={filters.title}
                onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input 
                placeholder="Remote, New York, London..." 
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience Level</label>
              <Select 
                value={filters.experienceLevel} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Experience Level</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Job Type</label>
              <Select 
                value={filters.jobType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Job Type</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Posted</label>
              <Select 
                value={filters.datePosted} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, datePosted: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Time</SelectItem>
                  <SelectItem value="day">Past 24 hours</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="bg-accent text-white w-full"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Jobs
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Job Results */}
        <div className="bg-white rounded-lg border border-border/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map((job: any) => (
                <div key={job.id} className="border border-border/10 rounded-lg p-5 hover:border-accent transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center mr-4">
                          <span className="font-bold text-foreground">
                            {job.company?.name ? job.company.name.charAt(0) : "?"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-foreground">{job.title}</h4>
                          <p className="text-muted-foreground">{job.company?.name}</p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                            {job.salary && (
                              <span className="ml-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.experienceLevel && (
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                            </span>
                          )}
                          
                          {job.jobType && (
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                              {job.jobType.replace('_', '-').split('-').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join('-')}
                            </span>
                          )}
                          
                          {job.skills && job.skills.map((skill: string, index: number) => (
                            <span key={index} className="text-xs bg-accent/10 text-foreground px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between h-full">
                      <div className="text-xs text-muted-foreground mb-4">
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                      
                      <Button 
                        className={`${job.isEasyApply ? 'bg-accent' : 'bg-primary'} text-white`}
                        onClick={() => handleApply(job.id)}
                        disabled={applying[job.id]}
                      >
                        {applying[job.id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Applying...
                          </>
                        ) : (
                          <>
                            {job.isEasyApply ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Easy Apply
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                Apply
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                      disabled={filters.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-medium mb-2">No jobs found</h4>
              <p>Try adjusting your search filters or try again later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;

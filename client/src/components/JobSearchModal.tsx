import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { jobTypeEnum, experienceLevelEnum } from "@shared/schema";

interface JobSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobSearchModal = ({ isOpen, onClose }: JobSearchModalProps) => {
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    experienceLevel: "",
    jobType: "",
    datePosted: "",
  });
  const [searching, setSearching] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['/api/jobs', { ...filters, isEasyApply: true }],
    enabled: false
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedJobs([]);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      await refetch();
    } finally {
      setSearching(false);
    }
  };

  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const handleBatchApply = async () => {
    if (selectedJobs.length === 0) return;
    
    setApplying(true);
    try {
      await apiRequest('POST', '/api/apply-batch', { jobIds: selectedJobs });
      
      toast({
        title: "Applications Submitted",
        description: `Successfully applied to ${selectedJobs.length} jobs.`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/applications/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      onClose();
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "There was an error submitting your applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Search & Auto-Apply</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {/* Search Form */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="block text-muted-foreground text-sm mb-1" htmlFor="job-title">Job Title</Label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input 
                    id="job-title" 
                    placeholder="Frontend Developer, UX Designer, etc." 
                    className="pl-10"
                    value={filters.title}
                    onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="block text-muted-foreground text-sm mb-1" htmlFor="location">Location</Label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <Input 
                    id="location" 
                    placeholder="Remote, New York, London, etc." 
                    className="pl-10"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="block text-muted-foreground text-sm mb-1" htmlFor="experience">Experience Level</Label>
                <Select 
                  value={filters.experienceLevel} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger id="experience" className="w-full">
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
              <div>
                <Label className="block text-muted-foreground text-sm mb-1" htmlFor="job-type">Job Type</Label>
                <Select 
                  value={filters.jobType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}
                >
                  <SelectTrigger id="job-type" className="w-full">
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
                <Label className="block text-muted-foreground text-sm mb-1" htmlFor="date-posted">Date Posted</Label>
                <Select 
                  value={filters.datePosted} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, datePosted: value }))}
                >
                  <SelectTrigger id="date-posted" className="w-full">
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
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                className="bg-accent text-white" 
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
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search Results */}
          {jobs && (
            <div className="border-t border-border/20 pt-6">
              <h4 className="font-medium text-foreground mb-4">
                {jobs.length} "Easy Apply" Jobs Found
              </h4>
              
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job: any) => (
                    <div key={job.id} className="border border-border/10 rounded-lg p-4 hover:border-accent transition-colors">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-semibold text-foreground mb-1">{job.title}</h5>
                          <p className="text-muted-foreground text-sm mb-2">{job.company?.name}</p>
                          <div className="text-xs text-muted-foreground/80 flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location}</span>
                            {job.salary && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{job.salary}</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.skills && job.skills.map((skill: string, index: number) => (
                              <span key={index} className="text-xs bg-accent/10 text-foreground px-2 py-1 rounded">{skill}</span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <span className="text-xs text-muted-foreground">
                            Posted {new Date(job.postedDate).toLocaleDateString()}
                          </span>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Easy Apply
                            </span>
                            <Switch 
                              checked={selectedJobs.includes(job.id)} 
                              onCheckedChange={() => toggleJobSelection(job.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No jobs found matching your criteria. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t border-border/20 p-4 bg-secondary">
          <div className="flex flex-col md:flex-row justify-between items-center w-full">
            <div className="mb-4 md:mb-0">
              <div className="text-sm text-muted-foreground">
                {selectedJobs.length} jobs selected for auto-apply
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-accent text-white" 
                onClick={handleBatchApply} 
                disabled={selectedJobs.length === 0 || applying}
              >
                {applying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Auto-Apply to Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobSearchModal;

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ResumeManager = () => {
  const [user, setUser] = useState<any>({
    fullName: "User"
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showKeywordHighlighter, setShowKeywordHighlighter] = useState(false);
  const [newResume, setNewResume] = useState({
    title: "",
    content: "",
    isDefault: false
  });
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keywordHighlights, setKeywordHighlights] = useState<string[]>([]);
  
  const { toast } = useToast();
  
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

  // Query resumes
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

  // Handle creating a new resume
  const handleCreateResume = async () => {
    if (!newResume.title || !newResume.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      await apiRequest('POST', '/api/resumes', newResume);
      
      toast({
        title: "Resume Created",
        description: "Your resume has been successfully created.",
        variant: "default",
      });
      
      // Reset form and close modal
      setNewResume({
        title: "",
        content: "",
        isDefault: false
      });
      setShowResumeModal(false);
      
      // Refetch resumes
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle deleting a resume
  const handleDeleteResume = async (id: number) => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      await apiRequest('DELETE', `/api/resumes/${id}`, undefined);
      
      toast({
        title: "Resume Deleted",
        description: "Your resume has been successfully deleted.",
        variant: "default",
      });
      
      // Refetch resumes
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle setting a resume as default
  const handleSetDefault = async (id: number) => {
    if (!id) return;
    
    try {
      await apiRequest('PUT', `/api/resumes/${id}`, { isDefault: true });
      
      toast({
        title: "Default Resume Updated",
        description: "Your default resume has been updated.",
        variant: "default",
      });
      
      // Refetch resumes
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your default resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle keyword analysis
  const analyzeKeywords = () => {
    if (!jobDescription || !selectedResumeId) return;
    
    // Find selected resume
    const selectedResume = resumes.find((resume: any) => resume.id === selectedResumeId);
    if (!selectedResume) return;
    
    // Simple keyword extraction - in real application this would use NLP
    const resumeContent = selectedResume.content.toLowerCase();
    const jobDescWords = jobDescription.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter out short words
      .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
    
    // Find keywords that are in the job description but not in the resume
    const missingKeywords = jobDescWords.filter(word => !resumeContent.includes(word));
    
    // Limit to most relevant keywords (max 10)
    setKeywordHighlights(missingKeywords.slice(0, 10));
  };

  return (
    <div>
      <Header 
        title="Resume Manager" 
        subtitle="Create and customize resumes for job applications"
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">My Resumes</h3>
            <p className="text-sm text-muted-foreground">
              Create and customize different versions of your resume for specific job applications
            </p>
          </div>
          <Button 
            className="bg-accent text-white"
            onClick={() => setShowResumeModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Resume
          </Button>
        </div>
        
        <Tabs defaultValue="resumes">
          <TabsList className="mb-6">
            <TabsTrigger value="resumes">My Resumes</TabsTrigger>
            <TabsTrigger value="optimizer">Resume Optimizer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumes">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : resumes && resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume: any) => (
                  <Card key={resume.id} className={`${resume.isDefault ? 'border-accent' : 'border-border/20'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{resume.title}</CardTitle>
                          <CardDescription>
                            Created on {new Date(resume.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {resume.isDefault && (
                          <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground mb-2 bg-secondary/50 p-3 rounded">
                        {resume.content.substring(0, 300)}{resume.content.length > 300 ? '...' : ''}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive" 
                          onClick={() => handleDeleteResume(resume.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                      {!resume.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(resume.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-border/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-lg font-medium mb-2">No resumes found</h4>
                <p className="text-muted-foreground mb-6">Create your first resume to start applying for jobs</p>
                <Button 
                  className="bg-accent text-white"
                  onClick={() => setShowResumeModal(true)}
                >
                  Create New Resume
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="optimizer">
            <div className="bg-white border border-border/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Resume Keyword Optimizer</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Analyze your resume against job descriptions to identify missing keywords and improve your match rate
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium mb-2">Select Resume</Label>
                  {isLoading ? (
                    <div className="h-10 bg-secondary animate-pulse rounded"></div>
                  ) : resumes && resumes.length > 0 ? (
                    <select 
                      className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
                      value={selectedResumeId || ""}
                      onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                    >
                      <option value="">Select a resume</option>
                      {resumes.map((resume: any) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title} {resume.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 bg-secondary/50 rounded">
                      No resumes available. Please create a resume first.
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Label className="block text-sm font-medium mb-2">Paste Job Description</Label>
                    <Textarea 
                      placeholder="Paste the job description here to analyze keywords..."
                      className="min-h-[200px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="mt-4 bg-accent text-white"
                    onClick={analyzeKeywords}
                    disabled={!jobDescription || !selectedResumeId}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Analyze Keywords
                  </Button>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">Keyword Analysis Results</Label>
                  {keywordHighlights.length > 0 ? (
                    <div className="border border-border/20 rounded-lg p-4 bg-secondary/30 min-h-[300px]">
                      <h4 className="font-medium mb-3">Keywords to Consider Adding:</h4>
                      <div className="flex flex-wrap gap-2">
                        {keywordHighlights.map((keyword, index) => (
                          <span key={index} className="bg-accent/10 text-foreground px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 text-sm text-muted-foreground">
                        <p className="mb-2">
                          <strong>Recommendation:</strong> Consider adding these keywords to your resume to increase your match rate.
                        </p>
                        <p>
                          Applicant Tracking Systems (ATS) often filter resumes based on keyword matches. Including relevant keywords from the job description can improve your chances of getting past initial screenings.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border/20 rounded-lg p-4 bg-secondary/30 min-h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Select a resume and paste a job description to analyze keyword match.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Resume Modal */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Resume Title</Label>
              <Input 
                id="title" 
                value={newResume.title}
                onChange={(e) => setNewResume(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Frontend Developer Resume"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="content">Resume Content</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Set as default</span>
                  <Switch 
                    checked={newResume.isDefault}
                    onCheckedChange={(checked) => setNewResume(prev => ({ ...prev, isDefault: checked }))}
                  />
                </div>
              </div>
              <Textarea 
                id="content" 
                value={newResume.content}
                onChange={(e) => setNewResume(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Paste your resume content here..."
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResumeModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-accent text-white"
              onClick={handleCreateResume}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Resume'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeManager;

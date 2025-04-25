import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Profile = () => {
  const [user, setUser] = useState<any>({
    fullName: "User"
  });
  const [profileForm, setProfileForm] = useState({
    headline: "",
    summary: "",
    location: "",
    phoneNumber: "",
    website: "",
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    onSuccess: (data) => {
      if (data) {
        setProfileForm({
          headline: data.headline || "",
          summary: data.summary || "",
          location: data.location || "",
          phoneNumber: data.phoneNumber || "",
          website: data.website || "",
          skills: data.skills || []
        });
      }
    }
  });

  // Handle adding a skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check if skill already exists
    if (profileForm.skills.includes(newSkill.trim())) {
      toast({
        title: "Skill Exists",
        description: "This skill is already in your profile.",
        variant: "destructive",
      });
      return;
    }
    
    setProfileForm(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill("");
  };

  // Handle removing a skill
  const handleRemoveSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await apiRequest('PUT', '/api/user/profile', profileForm);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
      
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Header 
        title="My Profile" 
        subtitle="Manage your profile information"
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-lg border border-border/20 p-6">
          <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-secondary animate-pulse rounded w-1/4"></div>
              <div className="h-10 bg-secondary animate-pulse rounded"></div>
              <div className="h-8 bg-secondary animate-pulse rounded w-1/4"></div>
              <div className="h-10 bg-secondary animate-pulse rounded"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={user.fullName || ""} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is your display name that's connected to your account.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user.email || ""} 
                    disabled 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input 
                    id="headline" 
                    placeholder="e.g., Senior Frontend Developer" 
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, headline: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g., San Francisco, CA" 
                    value={profileForm.location}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea 
                  id="summary" 
                  placeholder="Brief description of your professional background, skills, and career goals" 
                  className="min-h-[120px]"
                  value={profileForm.summary}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="e.g., (555) 123-4567" 
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website/Portfolio</Label>
                  <Input 
                    id="website" 
                    placeholder="e.g., https://yourportfolio.com" 
                    value={profileForm.website}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileForm.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button 
                        type="button"
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex">
                  <Input 
                    placeholder="Add a skill (e.g., JavaScript, Project Management)" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="mr-2"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddSkill}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-accent text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Connection</CardTitle>
              <CardDescription>
                Connect your LinkedIn account to enable auto-apply features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.linkedinConnected ? 'bg-green-100' : 'bg-secondary'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${user.linkedinConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {user.linkedinConnected ? 'Connected' : 'Not Connected'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.linkedinConnected 
                      ? 'Your LinkedIn account is connected'
                      : 'Connect to auto-apply for jobs'}
                  </p>
                </div>
              </div>
              <Button 
                className={`w-full mt-4 ${user.linkedinConnected ? 'bg-destructive text-white' : 'bg-[#0A66C2] text-white'}`}
              >
                {user.linkedinConnected ? 'Disconnect Account' : 'Connect LinkedIn'}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

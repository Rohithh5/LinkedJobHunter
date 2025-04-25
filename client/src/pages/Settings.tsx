import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [user, setUser] = useState<any>({
    fullName: "User"
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newJobAlerts: true,
    weeklyReports: true
  });
  const [searchCriteria, setSearchCriteria] = useState({
    title: "",
    keywords: [] as string[],
    location: "",
    experienceLevel: "",
    jobType: "",
    datePosted: "week",
    autoApply: false
  });
  const [newKeyword, setNewKeyword] = useState("");
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

  // Fetch saved search criteria
  const { data: savedSearchCriteria, isLoading } = useQuery({
    queryKey: ['/api/search-criteria'],
  });

  // Handle adding a keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    // Check if keyword already exists
    if (searchCriteria.keywords.includes(newKeyword.trim())) {
      toast({
        title: "Keyword Exists",
        description: "This keyword is already in your search criteria.",
        variant: "destructive",
      });
      return;
    }
    
    setSearchCriteria(prev => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim()]
    }));
    setNewKeyword("");
  };

  // Handle removing a keyword
  const handleRemoveKeyword = (keyword: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Handle saving search criteria
  const handleSaveSearchCriteria = async () => {
    if (!searchCriteria.title) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your search criteria.",
        variant: "destructive",
      });
      return;
    }
    
    if (searchCriteria.keywords.length === 0) {
      toast({
        title: "Missing Keywords",
        description: "Please add at least one keyword to your search criteria.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await apiRequest('POST', '/api/search-criteria', searchCriteria);
      
      toast({
        title: "Search Criteria Saved",
        description: "Your search criteria has been saved successfully.",
        variant: "default",
      });
      
      // Reset form
      setSearchCriteria({
        title: "",
        keywords: [],
        location: "",
        experienceLevel: "",
        jobType: "",
        datePosted: "week",
        autoApply: false
      });
      
      // Refresh search criteria
      queryClient.invalidateQueries({ queryKey: ['/api/search-criteria'] });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your search criteria. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notifications settings
  const handleNotificationChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // In a real app, this would also save to the backend
    toast({
      title: "Settings Updated",
      description: "Your notification settings have been updated.",
      variant: "default",
    });
  };

  return (
    <div>
      <Header 
        title="Settings" 
        subtitle="Manage your account settings and preferences"
        user={user}
      />
      
      <div className="container mx-auto p-4 lg:p-6">
        <Tabs defaultValue="notifications">
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="search">Auto-Apply Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications} 
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Application Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified when there's an update to your job applications</p>
                  </div>
                  <Switch 
                    checked={settings.applicationUpdates} 
                    onCheckedChange={(checked) => handleNotificationChange('applicationUpdates', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">New Job Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new jobs matching your criteria are available</p>
                  </div>
                  <Switch 
                    checked={settings.newJobAlerts} 
                    onCheckedChange={(checked) => handleNotificationChange('newJobAlerts', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Weekly Job Report</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of your job hunting activity</p>
                  </div>
                  <Switch 
                    checked={settings.weeklyReports} 
                    onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="search">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Apply Settings</CardTitle>
                    <CardDescription>
                      Create search criteria for automatic job applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Search Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g., Frontend Developer Jobs" 
                          value={searchCriteria.title}
                          onChange={(e) => setSearchCriteria(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label>Keywords</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {searchCriteria.keywords.map((keyword, index) => (
                            <span 
                              key={index} 
                              className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              {keyword}
                              <button 
                                type="button"
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveKeyword(keyword)}
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
                            placeholder="Add a keyword (e.g., React, TypeScript)" 
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="mr-2"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleAddKeyword}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g., Remote, San Francisco" 
                          value={searchCriteria.location}
                          onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select 
                            value={searchCriteria.experienceLevel} 
                            onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, experienceLevel: value }))}
                          >
                            <SelectTrigger id="experience">
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
                          <Label htmlFor="job-type">Job Type</Label>
                          <Select 
                            value={searchCriteria.jobType} 
                            onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, jobType: value }))}
                          >
                            <SelectTrigger id="job-type">
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date-posted">Date Posted</Label>
                          <Select 
                            value={searchCriteria.datePosted} 
                            onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, datePosted: value }))}
                          >
                            <SelectTrigger id="date-posted">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Past 24 hours</SelectItem>
                              <SelectItem value="week">Past Week</SelectItem>
                              <SelectItem value="month">Past Month</SelectItem>
                              <SelectItem value="any">Any Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-4">
                        <Switch 
                          id="auto-apply" 
                          checked={searchCriteria.autoApply}
                          onCheckedChange={(checked) => setSearchCriteria(prev => ({ ...prev, autoApply: checked }))}
                        />
                        <Label htmlFor="auto-apply">
                          Automatically apply to matching jobs
                        </Label>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          className="bg-accent text-white"
                          onClick={handleSaveSearchCriteria}
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
                            'Save Search Criteria'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Search Criteria</CardTitle>
                    <CardDescription>
                      Your saved job search criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <div className="h-12 bg-secondary animate-pulse rounded"></div>
                        <div className="h-12 bg-secondary animate-pulse rounded"></div>
                      </div>
                    ) : savedSearchCriteria && savedSearchCriteria.length > 0 ? (
                      <div className="space-y-4">
                        {savedSearchCriteria.map((criteria: any) => (
                          <div key={criteria.id} className="border border-border/20 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{criteria.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(criteria.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {criteria.autoApply && (
                                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">Auto-Apply</span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {criteria.keywords.map((keyword: string, idx: number) => (
                                <span key={idx} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            <div className="mt-3 flex justify-end space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No saved search criteria yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={user?.username || ""} disabled />
                    </div>
                    <div>
                      <Label htmlFor="account-email">Email</Label>
                      <Input id="account-email" value={user?.email || ""} disabled />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border/20 pt-6">
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    
                    <Button className="bg-accent text-white">
                      Update Password
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-border/20 pt-6">
                  <h3 className="text-lg font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

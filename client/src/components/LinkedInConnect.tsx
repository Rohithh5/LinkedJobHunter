import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LinkedInConnectProps {
  isConnected: boolean;
  onConnect: () => void;
}

const LinkedInConnect = ({ isConnected, onConnect }: LinkedInConnectProps) => {
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      // In a real implementation, this would redirect to LinkedIn OAuth
      // For demo purposes, we'll call our simulated API endpoint
      await apiRequest('GET', '/api/linkedin/connect', undefined);
      onConnect();
      
      toast({
        title: "LinkedIn Connected",
        description: "Your LinkedIn account has been successfully connected.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect LinkedIn account. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="mb-6 bg-white rounded-lg border border-accent p-6 text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Connect with LinkedIn</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          To start applying for jobs automatically, we need to connect to your LinkedIn account. 
          This allows JobApplyAI to apply to "Easy Apply" jobs on your behalf.
        </p>
        <button 
          onClick={handleConnect}
          className="bg-[#0A66C2] text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          Connect LinkedIn Account
        </button>
      </div>
    </div>
  );
};

export default LinkedInConnect;

import { useState } from "react";

interface QuickApplyProps {
  isConnected: boolean;
  onSearchClick: () => void;
}

const QuickApply = ({ isConnected, onSearchClick }: QuickApplyProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    
    // Simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      onSearchClick();
    }, 300);
  };

  return (
    <div className="mt-6 bg-white rounded-lg border border-accent p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to apply to more jobs?</h3>
          <p className="text-muted-foreground max-w-xl">
            {isConnected 
              ? "JobApplyAI can automatically apply to jobs that match your skills and preferences. Set your criteria and let our AI handle the rest."
              : "Connect your LinkedIn account to auto-apply to jobs that match your skills and preferences."}
          </p>
        </div>
        <button 
          className="bg-accent text-white px-6 py-3 rounded-md font-medium hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors w-full md:w-auto whitespace-nowrap flex items-center justify-center"
          onClick={handleClick}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Loading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search & Auto-Apply
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickApply;

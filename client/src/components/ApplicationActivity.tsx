import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

const ApplicationActivity = () => {
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['/api/applications/recent'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-border/20 p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-foreground">Recent Applications</h3>
          <span className="text-accent text-sm">Loading...</span>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-border/10 pb-4 last:border-0">
              <div className="h-4 bg-secondary animate-pulse rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-secondary animate-pulse rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-secondary animate-pulse rounded w-1/4"></div>
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
          <p className="text-destructive">Error loading applications. Please try again.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE'); // Day of week
    } else {
      return format(date, 'MMM d'); // e.g. "Jun 5"
    }
  };

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-400';
      case 'in_review':
        return 'bg-yellow-400';
      case 'viewed':
        return 'bg-green-500';
      case 'interview_scheduled':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'no_response':
        return 'bg-gray-400';
      case 'hired':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'in_review':
        return 'In Review';
      case 'viewed':
        return 'Application Viewed';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'rejected':
        return 'Not Selected';
      case 'no_response':
        return 'No Response';
      case 'hired':
        return 'Hired';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border/20 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-foreground">Recent Applications</h3>
        <a href="/application-history" className="text-accent text-sm hover:underline">View All</a>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto scroll-custom">
        {applications && applications.length > 0 ? (
          applications.map((app: any) => (
            <div key={app.application.id} className="border-b border-border/10 pb-4 last:border-0">
              <div className="flex justify-between mb-1">
                <div className="font-medium text-foreground">{app.job.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(app.application.applicationDate)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{app.company.name}</div>
              <div className="flex items-center">
                <span className={cn("status-dot", getStatusDotClass(app.application.status))}></span>
                <span className="text-sm text-muted-foreground">{formatStatus(app.application.status)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No applications yet. Start applying to jobs!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationActivity;

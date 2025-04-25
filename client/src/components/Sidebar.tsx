import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    fullName: string;
    linkedinConnected: boolean;
  };
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location] = useLocation();

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: "home" },
    { href: "/job-search", label: "Job Search", icon: "search" },
    { href: "/application-history", label: "Application History", icon: "history" },
    { href: "/resume-manager", label: "Resume Manager", icon: "file-text" },
    { href: "/profile", label: "Profile", icon: "user" },
    { href: "/settings", label: "Settings", icon: "settings" }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-border/20 md:h-screen">
      {/* Logo Area */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-center md:justify-start">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="ml-3 text-2xl font-bold">JobApplyAI</h1>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="p-4">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center p-2 rounded-md text-foreground hover:bg-secondary transition-colors",
                    location === item.href && "bg-accent/10"
                  )}
                >
                  <span className="w-6 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon === "home" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                      {item.icon === "search" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                      {item.icon === "history" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {item.icon === "file-text" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {item.icon === "user" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                      {item.icon === "settings" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
                      {item.icon === "settings" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    </svg>
                  </span>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* LinkedIn Connection Status */}
      <div className="mt-auto p-4 border-t border-border/20">
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className={cn(
              "w-3 h-3 rounded-full mr-2",
              user?.linkedinConnected ? "bg-green-500" : "bg-yellow-500"
            )}></div>
            <p className="text-sm text-muted-foreground">
              {user?.linkedinConnected ? "LinkedIn Connected" : "LinkedIn Not Connected"}
            </p>
          </div>
          <div className="text-xs text-muted-foreground/80">
            {user?.linkedinConnected 
              ? "Last synced: Today, 2:30 PM" 
              : "Connect your LinkedIn account to auto-apply"}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: {
    fullName: string;
  };
}

const Header = ({ title, subtitle, user }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-border/20 p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex items-center">
          <button className="mr-4 p-2 rounded-full hover:bg-secondary relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-medium">{user.fullName.charAt(0)}</span>
            </div>
            <span className="ml-2 hidden md:inline text-foreground">{user.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

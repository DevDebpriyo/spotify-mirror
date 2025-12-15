import { ChevronLeft, ChevronRight, Bell, User, ExternalLink, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  transparent?: boolean;
  bgColor?: string;
}

const Header = ({ transparent = false, bgColor }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between px-6 py-4 transition-colors duration-300",
        transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-md"
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-spotify-black/70 rounded-full p-1 hover:bg-spotify-black transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="invisible sm:visible bg-spotify-black/70 rounded-full p-1 hover:bg-spotify-black transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <button className="bg-spotify-black/70 rounded-full p-2 hover:bg-spotify-black transition-colors hidden sm:block">
              <Bell className="h-5 w-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-spotify-black/70 rounded-full p-1 pr-3 hover:bg-spotify-black transition-colors">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-semibold text-sm hidden sm:block">{user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-border">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <span>Profile</span>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="text-muted-foreground font-semibold hover:text-foreground hover:scale-105 transition-all"
            >
              Sign up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="spotify-button-primary py-2 px-6"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import { Home, Search, Library, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={cn(
      "flex flex-col gap-2 h-full transition-all duration-300",
      isCollapsed ? "w-[72px]" : "w-[280px] lg:w-[320px]"
    )}>
      {/* Main Navigation */}
      <div className="bg-sidebar rounded-lg p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "spotify-nav-item",
                isActive(item.path) && "active"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive(item.path) && "text-foreground")} />
              {!isCollapsed && (
                <span className={cn("font-semibold", isActive(item.path) && "text-foreground")}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Library Section */}
      <div className="bg-sidebar rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <Link 
            to="/library" 
            className={cn(
              "spotify-nav-item",
              isActive('/library') && "active"
            )}
          >
            <Library className="h-6 w-6" />
            {!isCollapsed && <span className="font-semibold">Your Library</span>}
          </Link>
          
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <button className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <Plus className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Library Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {!isCollapsed && (
            <div className="space-y-2">
              {/* Create Playlist Card */}
              <div className="bg-accent rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-foreground">Create your first playlist</h4>
                  <p className="text-sm text-muted-foreground mt-1">It's easy, we'll help you</p>
                </div>
                <button className="spotify-button-primary text-sm py-2 px-4">
                  Create playlist
                </button>
              </div>

              {/* Browse Podcasts Card */}
              <div className="bg-accent rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-foreground">Let's find some podcasts to follow</h4>
                  <p className="text-sm text-muted-foreground mt-1">We'll keep you updated on new episodes</p>
                </div>
                <button className="spotify-button-primary text-sm py-2 px-4">
                  Browse podcasts
                </button>
              </div>

              {/* Liked Songs */}
              <Link
                to="/library/liked"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-muted-foreground rounded flex items-center justify-center">
                  <Heart className="h-5 w-5 text-foreground fill-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Liked Songs</p>
                  <p className="text-sm text-muted-foreground">Playlist</p>
                </div>
              </Link>
            </div>
          )}

          {isCollapsed && (
            <div className="space-y-2">
              <Link
                to="/library/liked"
                className="block p-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-muted-foreground rounded flex items-center justify-center">
                  <Heart className="h-5 w-5 text-foreground fill-foreground" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

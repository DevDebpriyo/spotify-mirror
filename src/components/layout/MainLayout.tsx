import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import MobileNav from './MobileNav';

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-spotify-black overflow-hidden">
      <div className="flex flex-1 gap-2 p-2 pb-0 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block h-full">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 bg-background rounded-lg overflow-hidden">
          <Outlet />
        </main>
      </div>
      
      {/* Now Playing Bar */}
      <NowPlayingBar />
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;

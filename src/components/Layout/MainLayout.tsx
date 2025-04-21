
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, LayoutDashboard, Briefcase, MessageCircle, User, LogOut, Plus, Users, ChevronLeft, ChevronRight, BookmarkCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const navLinks = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/jobs', label: 'Propuestas', icon: <Briefcase className="h-5 w-5" /> },
    { path: '/saved-jobs', label: 'Guardadas', icon: <BookmarkCheck className="h-5 w-5" /> },
    { path: '/chats', label: 'Mensajes', icon: <MessageCircle className="h-5 w-5" /> },
    { path: '/profile', label: 'Perfil', icon: <User className="h-5 w-5" /> },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-sidebar-background border-r border-border transform transition-all duration-300 ease-in-out
          ${isMobile ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full') : 'translate-x-0'}
          ${!isMobile && sidebarCollapsed ? 'w-16' : 'w-64'}
          md:relative
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className={`flex items-center space-x-2 ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-md bg-wfc-purple flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">WFC</span>
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <span className="text-lg font-bold text-sidebar-foreground">WorkFlow Connect</span>
              )}
            </Link>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="hover:bg-sidebar-accent/50"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          
          <Separator />
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(link.path) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}
                    ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
                  `}
                >
                  {link.icon}
                  {(!sidebarCollapsed || isMobile) && <span className="ml-3">{link.label}</span>}
                </Link>
              ))}
              
              <Link
                to="/create-job"
                className={`
                  flex items-center px-3 py-2 mt-4 rounded-md text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:bg-wfc-purple-medium transition-colors
                  ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
                `}
              >
                <Plus className="h-5 w-5" />
                {(!sidebarCollapsed || isMobile) && <span className="ml-3">Crear Propuesta</span>}
              </Link>
            </nav>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.photoURL} alt={currentUser?.name} />
                      <AvatarFallback className="bg-wfc-purple-medium text-white">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="py-2 px-4 border-b md:hidden">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-wfc-purple flex items-center justify-center">
                <span className="text-white font-bold">WFC</span>
              </div>
              <span className="text-lg font-bold">WorkFlow Connect</span>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.photoURL} alt={currentUser?.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

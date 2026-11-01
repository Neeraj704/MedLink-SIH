import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import {
  Activity, Users, Calendar, Code2, FileText, Settings, User,
  Sun, Moon, ChevronRight, LogOut, Menu, Search, Home
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useLinkedPatients } from '@/hooks/data/usePatients';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const doctorNav = [
  { path: '/doctor', icon: Home, label: 'Dashboard' },
  { path: '/doctor/patients', icon: Users, label: 'Patients' },
  { path: '/doctor/consultation', icon: FileText, label: 'Consultation' },
  { path: '/doctor/code-translation', icon: Code2, label: 'Code Translation' },
  { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/doctor/fhir', icon: FileText, label: 'FHIR Records' },
  { path: '/doctor/clinic-settings', icon: Settings, label: 'Clinic Settings' },
  { path: '/doctor/profile', icon: User, label: 'Profile' },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Search patients state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: patients = [] } = useLinkedPatients();

  const searchResults = searchQuery.trim().length >= 2
    ? patients.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.full_name.toLowerCase().includes(q) ||
          (p.mobile && p.mobile.includes(q)) ||
          (p.abha_number && p.abha_number.includes(q));
      })
    : [];

  useEffect(() => { setSidebarOpen(false); setSearchOpen(false); }, [location.pathname]);

  const breadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((p, i) => ({
      label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
      path: '/' + parts.slice(0, i + 1).join('/'),
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 bg-card border-r flex flex-col transition-all duration-300 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className={`h-16 border-b flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">MedLink</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {doctorNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        <div className={`p-3 border-t ${collapsed ? 'px-2' : ''}`}>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b glass-strong flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs().map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <Link to={b.path} className="hover:text-foreground transition-colors">{b.label}</Link>
              </span>
            ))}
          </div>

          <div className="flex-1" />

          {/* Patient Quick Search with Popover */}
          <div className="hidden md:block relative w-72">
            <Popover open={searchOpen && searchResults.length > 0} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search linked patients..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    className="pl-9 h-9 bg-muted/50 border-0"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-1 max-h-60 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate(`/doctor/patients/${p.id}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded hover:bg-muted text-sm flex flex-col"
                  >
                    <span className="font-medium text-foreground">{p.full_name}</span>
                    <span className="text-xs text-muted-foreground">{p.abha_number || p.mobile}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                {!collapsed && <span className="hidden md:block text-sm font-medium">{user?.name || 'Doctor'}</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/doctor/profile')}>
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/doctor/clinic-settings')}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

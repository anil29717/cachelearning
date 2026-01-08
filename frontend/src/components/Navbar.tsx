import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, BookOpen, LayoutDashboard, Home, Search, ChevronDown, UserPlus, Briefcase, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';
import { apiClient } from '../utils/api';
import { Course } from '../types';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [suggestions, setSuggestions] = useState<{ label: string; onClick: () => void }[]>([]);
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Sync header search with `q` param in URL so the input reflects current query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setHeaderSearch(q);
  }, [location.search]);

  useEffect(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const categoryMap: Record<string, string> = {
      'all': 'All',
      'cloud': 'Cloud',
      'cyber security': 'Cyber Security',
      'data analytics & ai': 'Data Analytics & AI',
      'networking': 'Networking',
    };
    const subCategoryMap: Record<string, { category: string; term: string }> = {
      'cloud foundations': { category: 'Cloud', term: 'Cloud Foundations' },
      'cloud infrastructure': { category: 'Cloud', term: 'Cloud Infrastructure' },
      'cloud security & networking': { category: 'Cloud', term: 'Cloud Security & Networking' },
      'devops & automation': { category: 'Cloud', term: 'DevOps & Automation' },
      'security foundations': { category: 'Cyber Security', term: 'Security Foundations' },
      'network & cloud security': { category: 'Cyber Security', term: 'Network & Cloud Security' },
      'threat protection': { category: 'Cyber Security', term: 'Threat Protection' },
      'governance & incident response': { category: 'Cyber Security', term: 'Governance & Incident Response' },
      'data processing': { category: 'Data Analytics & AI', term: 'Data Processing' },
      'data visualization & bi': { category: 'Data Analytics & AI', term: 'Data Visualization & BI' },
      'machine & deep learning': { category: 'Data Analytics & AI', term: 'Machine & Deep Learning' },
      'generative ai': { category: 'Data Analytics & AI', term: 'Generative AI' },
      'network basics': { category: 'Networking', term: 'Network Basics' },
      'network infrastructure': { category: 'Networking', term: 'Network Infrastructure' },
      'network security': { category: 'Networking', term: 'Network Security' },
      'network automation & monitoring': { category: 'Networking', term: 'Network Automation & Monitoring' },
    };
    const routeAliases: Record<string, string> = {
      'home': '/',
      'index': '/',
      'landing': '/landing',
      'login': '/login',
      'sign in': '/login',
      'signin': '/login',
      'register': '/register',
      'signup': '/register',
      'sign up': '/register',
      'cart': '/cart',
      'basket': '/cart',
      'profile': '/profile',
      'account': '/profile',
      'instructor': '/instructor',
      'teacher': '/instructor',
      'dashboard': '/instructor',
      'admin': '/admin',
      'config': '/debug/config',
      'debug': '/debug/config',
      'configuration': '/debug/config',
      'become instructor': '/become-instructor',
      'instructor apply': '/become-instructor',
      'hiring': '/hiring',
      'jobs': '/hiring',
      'careers': '/hiring',
      'testimonials': '/testimonials',
      'reviews': '/testimonials',
    };
    const s: { label: string; onClick: () => void }[] = [];
    Object.values(categoryMap)
      .filter(v => v.toLowerCase().includes(q))
      .forEach(v => s.push({ label: v, onClick: () => navigate(`/courses?${new URLSearchParams({ category: v }).toString()}`) }));
    Object.values(subCategoryMap)
      .filter(v => v.term.toLowerCase().includes(q))
      .forEach(v => s.push({ label: `${v.category} • ${v.term}`, onClick: () => navigate(`/courses?${new URLSearchParams({ category: v.category, subcategory: v.term, q: v.term }).toString()}`) }));
    Object.keys(routeAliases)
      .filter(k => k.includes(q))
      .forEach(k => s.push({ label: k, onClick: () => navigate(routeAliases[k]) }));
    const courseMatches = allCourses.filter(c => c.title.toLowerCase().includes(q)).slice(0, 8);
    courseMatches.forEach(c => s.push({ label: c.title, onClick: () => navigate(`/course/${String(c.id)}`) }));
    setSuggestions(s.slice(0, 10));
  }, [headerSearch, allCourses, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const { courses } = await apiClient.getCourses();
        setAllCourses(courses);
      } catch (e) {}
    };
    if (showSuggestions && allCourses.length === 0) load();
  }, [showSuggestions, allCourses.length]);

  const submitHeaderSearch = async () => {
    const raw = headerSearch.trim();
    const q = raw.toLowerCase();
    if (!q) {
      navigate('/');
      return;
    }
    const categoryMap: Record<string, string> = {
      'all': 'All',
      'cloud': 'Cloud',
      'cyber security': 'Cyber Security',
      'data analytics & ai': 'Data Analytics & AI',
      'networking': 'Networking',
    };
    if (categoryMap[q]) {
      const params = new URLSearchParams();
      params.set('category', categoryMap[q]);
      navigate(`/courses?${params.toString()}`);
      return;
    }
    const subCategoryMap: Record<string, { category: string; term: string }> = {
      // Cloud
      'cloud foundations': { category: 'Cloud', term: 'Cloud Foundations' },
      'cloud infrastructure': { category: 'Cloud', term: 'Cloud Infrastructure' },
      'cloud security & networking': { category: 'Cloud', term: 'Cloud Security & Networking' },
      'devops & automation': { category: 'Cloud', term: 'DevOps & Automation' },
      // Cyber Security
      'security foundations': { category: 'Cyber Security', term: 'Security Foundations' },
      'network & cloud security': { category: 'Cyber Security', term: 'Network & Cloud Security' },
      'threat protection': { category: 'Cyber Security', term: 'Threat Protection' },
      'governance & incident response': { category: 'Cyber Security', term: 'Governance & Incident Response' },
      // Data Analytics & AI
      'data processing': { category: 'Data Analytics & AI', term: 'Data Processing' },
      'data visualization & bi': { category: 'Data Analytics & AI', term: 'Data Visualization & BI' },
      'machine & deep learning': { category: 'Data Analytics & AI', term: 'Machine & Deep Learning' },
      'generative ai': { category: 'Data Analytics & AI', term: 'Generative AI' },
      // Networking
      'network basics': { category: 'Networking', term: 'Network Basics' },
      'network infrastructure': { category: 'Networking', term: 'Network Infrastructure' },
      'network security': { category: 'Networking', term: 'Network Security' },
      'network automation & monitoring': { category: 'Networking', term: 'Network Automation & Monitoring' },
    };
    if (subCategoryMap[q]) {
      const s = subCategoryMap[q];
      const params = new URLSearchParams();
      params.set('category', s.category);
      params.set('subcategory', s.term);
      params.set('q', s.term);
      navigate(`/courses?${params.toString()}`);
      return;
    }
    const routeAliases: Record<string, string> = {
      'home': '/',
      'index': '/',
      'landing': '/landing',
      'login': '/login',
      'sign in': '/login',
      'signin': '/login',
      'register': '/register',
      'signup': '/register',
      'sign up': '/register',
      'cart': '/cart',
      'basket': '/cart',
      'profile': '/profile',
      'account': '/profile',
      'instructor': '/instructor',
      'teacher': '/instructor',
      'dashboard': '/instructor',
      'admin': '/admin',
      'config': '/debug/config',
      'debug': '/debug/config',
      'configuration': '/debug/config',
      'become instructor': '/become-instructor',
      'instructor apply': '/become-instructor',
      'hiring': '/hiring',
      'jobs': '/hiring',
      'careers': '/hiring',
      'testimonials': '/testimonials',
      'reviews': '/testimonials',
    };
    if (routeAliases[q]) {
      navigate(routeAliases[q]);
      return;
    }
    const idMatch = raw.match(/^(?:course|learn)\s+([A-Za-z0-9_-]+)/i);
    if (idMatch) {
      const id = idMatch[1];
      if (q.startsWith('learn')) {
        navigate(`/learn/${id}`);
      } else {
        navigate(`/course/${id}`);
      }
      return;
    }
    try {
      const { courses } = await apiClient.getCourses();
      const exact = courses.find(c => c.title.trim().toLowerCase() === q);
      if (exact) {
        navigate(`/course/${String(exact.id)}`);
        return;
      }
      const partial = courses.filter(c => c.title.toLowerCase().includes(q));
      if (partial.length === 1) {
        navigate(`/course/${String(partial[0].id)}`);
        return;
      }
    } catch (e) {
      // ignore fetch errors and fall back to keyword search
    }
    navigate(`/courses?q=${encodeURIComponent(raw)}`);
  };

  const navigateTo = (category: string, sub?: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (sub) params.set('subcategory', sub);
    navigate(`/courses?${params.toString()}`);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-red-100">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative p-2 bg-gradient-to-br from-red-600 via-red-500 to-red-400 rounded-xl transform group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent">
                Cache Learning
              </span>
            </Link>
            {/* All Courses dropdown */}
            <div className="ml-4 hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-md border-red-200 text-gray-900 bg-white hover:bg-red-50 px-3 py-2 text-sm font-medium"
                  >
                    All Courses
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[320px] p-2 rounded-md border border-gray-200 bg-white shadow-sm">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium text-gray-800 hover:bg-gray-50 px-2 py-2 rounded-md focus:bg-gray-100">Cloud</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cloud', 'Cloud Foundations')}>Cloud Foundations</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cloud', 'Cloud Infrastructure')}>Cloud Infrastructure</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cloud', 'Cloud Security & Networking')}>Cloud Security & Networking</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cloud', 'DevOps & Automation')}>DevOps & Automation</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium text-gray-800 hover:bg-gray-50 px-2 py-2 rounded-md focus:bg-gray-100">Cyber Security</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cyber Security', 'Security Foundations')}>Security Foundations</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cyber Security', 'Network & Cloud Security')}>Network & Cloud Security</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cyber Security', 'Threat Protection')}>Threat Protection</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Cyber Security', 'Governance & Incident Response')}>Governance & Incident Response</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium text-gray-800 hover:bg-gray-50 px-2 py-2 rounded-md focus:bg-gray-100">Data Analytics & AI</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Data Analytics & AI', 'Data Processing')}>Data Processing</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Data Analytics & AI', 'Data Visualization & BI')}>Data Visualization & BI</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Data Analytics & AI', 'Machine & Deep Learning')}>Machine & Deep Learning</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Data Analytics & AI', 'Generative AI')}>Generative AI</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium text-gray-800 hover:bg-gray-50 px-2 py-2 rounded-md focus:bg-gray-100">Networking</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Networking', 'Network Basics')}>Network Basics</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Networking', 'Network Infrastructure')}>Network Infrastructure</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Networking', 'Network Security')}>Network Security</DropdownMenuItem>
                      <DropdownMenuItem className="text-sm px-2 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => navigateTo('Networking', 'Network Automation & Monitoring')}>Network Automation & Monitoring</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {/* Centered Search */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
                <Input
                  aria-label="Search courses"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitHeaderSearch();
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  className="pl-9 pr-24 h-10 rounded-full bg-red-50 border border-red-200 focus-visible:ring-2 focus-visible:ring-red-500"
                  placeholder="What do you want to learn?"
                />
                
                  <Button
                    type="button"
                    variant="outline"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 px-4 text-sm border-red-200 hover:bg-red-50"
                    onClick={submitHeaderSearch}
                  >
                    Search
                  </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <ul className="py-2 max-h-72 overflow-auto">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              s.onClick();
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm"
                          >
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right-side links */}
            <div className="flex items-center gap-4">
              {/* <Link to="#" className="text-sm text-gray-700 hover:text-red-700">For Business</Link> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm text-gray-700 hover:text-red-700">
                    Training <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/training#students')}>
                    Students
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/training#professionals')}>
                    Professionals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/training#corporate')}>
                    Corporate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm text-gray-700 hover:text-red-700">
                    More <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/become-instructor')}>
                    <UserPlus className="h-4 w-4 mr-2 text-red-600" />
                    Become an Instructor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/hiring')}>
                    <Briefcase className="h-4 w-4 mr-2 text-red-600" />
                    Hiring Opportunities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/testimonials')}>
                    <MessageSquare className="h-4 w-4 mr-2 text-red-600" />
                    Testimonials
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

            {user ? (
              <>
                {/* Cart */}
                {user.role === 'student' && (
                  <Link to="/cart">
                    <Button variant="ghost" className="relative hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 group">
                      <ShoppingCart className="h-5 w-5 group-hover:text-red-600 transition-colors" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-full h-5 w-5 flex items-center justify-center shadow">
                          <span className="text-[10px] leading-none">{itemCount}</span>
                        </span>
                      )}
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="h-5 w-5" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    {user.role === 'instructor' && (
                      <DropdownMenuItem onClick={() => navigate('/instructor')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Instructor Dashboard
                      </DropdownMenuItem>
                    )}
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/training#students" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Students
              </Button>
            </Link>
            <Link to="/training#professionals" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Professionals
              </Button>
            </Link>
            <Link to="/training#corporate" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Corporate
              </Button>
            </Link>

            {user ? (
              <>
                {user.role === 'student' && (
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start relative">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {itemCount > 0 && (
                        <span className="ml-2 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center">
                          <span className="text-[10px] leading-none">{itemCount}</span>
                        </span>
                      )}
                </Button>
              </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                {user.role === 'instructor' && (
                  <Link to="/instructor" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Instructor Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

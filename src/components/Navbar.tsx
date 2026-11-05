import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, Bookmark, LogOut, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/Button';

export function Navbar({ onPromoteClick }: { onPromoteClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: 'Categories', to: '/categories' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-ink-950/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-indigo blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                <GraduationCap className="relative h-7 w-7 text-neon-indigo" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Lumina</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === link.to
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onPromoteClick}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neon-emerald hover:text-white rounded-lg border border-neon-emerald/30 hover:bg-neon-emerald/10 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Promote with Us
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/bookmarks"
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    title="My Bookmarks"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-lg text-neon-indigo hover:text-white hover:bg-neon-indigo/10 transition-all"
                      title="Admin Panel"
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-neon-indigo to-neon-violet flex items-center justify-center text-xs font-bold text-white">
                        {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white/80 max-w-[120px] truncate">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-ink-950/95 backdrop-blur-xl border-b border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onPromoteClick();
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-neon-emerald hover:bg-neon-emerald/10 rounded-lg"
                >
                  Promote with Us
                </button>
                {user ? (
                  <>
                    <Link to="/bookmarks" className="block px-4 py-3 text-sm text-white/80 hover:bg-white/5 rounded-lg">
                      My Bookmarks
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-3 text-sm text-neon-indigo hover:bg-white/5 rounded-lg">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-3 text-sm text-white/60 hover:bg-white/5 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="block px-4 py-3 text-sm text-white hover:bg-white/5 rounded-lg">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-16" />
    </>
  );
}

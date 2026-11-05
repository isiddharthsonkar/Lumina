import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer({ onPromoteClick }: { onPromoteClick: () => void }) {
  return (
    <footer className="relative border-t border-white/10 bg-ink-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-7 w-7 text-neon-indigo" />
              <span className="text-xl font-bold text-white">Lumina</span>
            </Link>
            <p className="text-sm text-white/50 max-w-md leading-relaxed">
              A premium education platform for curated YouTube courses. Learn distraction-free
              from the world's best instructors, all in one place.
            </p>
            <div className="flex gap-3 mt-6">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/bookmarks" className="hover:text-white transition-colors">My Bookmarks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Creators</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <button onClick={onPromoteClick} className="hover:text-white transition-colors">
                  Promote with Us
                </button>
              </li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">© 2026 Lumina. All rights reserved.</p>
          <p className="text-xs text-white/40">Built with passion for lifelong learners.</p>
        </div>
      </div>
    </footer>
  );
}

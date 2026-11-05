import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Linkedin, GraduationCap, ArrowLeft, Shield, Film, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ScrollReveal } from '@/components/ScrollReveal';

export function AuthPage() {
  const { signInWithLinkedIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <ScrollReveal direction="up">
          <div className="glass-strong rounded-3xl p-8 sm:p-10 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-neon-indigo/10 border border-neon-indigo/20 mb-6">
              <GraduationCap className="h-8 w-8 text-neon-indigo" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Lumina</h1>
            <p className="text-sm text-white/50 mb-8 max-w-sm mx-auto">
              Sign in with LinkedIn to like, bookmark, track progress, and leave verified reviews.
            </p>

            <button
              onClick={signInWithLinkedIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white font-medium transition-all hover:shadow-[0_0_30px_rgba(10,102,194,0.4)]"
            >
              <Linkedin className="h-5 w-5" />
              Continue with LinkedIn
            </button>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
              {[
                { icon: Shield, text: 'Verified reviews from real professionals' },
                { icon: Film, text: 'Distraction-free cinema-mode learning' },
                { icon: Sparkles, text: 'Track your progress across modules' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-white/50 text-left"
                >
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <item.icon className="h-4 w-4 text-neon-emerald" />
                  </div>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <p className="text-center text-xs text-white/30 mt-6">
          By continuing, you agree to Lumina's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

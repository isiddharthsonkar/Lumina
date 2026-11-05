import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Gradient blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-neon-indigo/20 blur-[120px] animate-blob-float"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-neon-violet/15 blur-[140px] animate-blob-float-slow"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-neon-emerald/15 blur-[100px] animate-blob-float"
      />

      {/* Floating geometric shapes */}
      <FloatingShape
        className="left-[10%] top-[20%]"
        size={80}
        delay={0}
        scrollY={y1}
        shape="ring"
      />
      <FloatingShape
        className="right-[15%] top-[60%]"
        size={60}
        delay={1}
        scrollY={y2}
        shape="square"
      />
      <FloatingShape
        className="left-[80%] top-[15%]"
        size={50}
        delay={2}
        scrollY={y3}
        shape="triangle"
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}

function FloatingShape({
  className,
  size,
  delay,
  scrollY,
  shape,
}: {
  className: string;
  size: number;
  delay: number;
  scrollY: MotionValue<number>;
  shape: 'ring' | 'square' | 'triangle';
}) {
  return (
    <motion.div
      style={{ y: scrollY }}
      className={`absolute ${className} hidden lg:block`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ delay: delay + 0.5, duration: 1 }}
    >
      <motion.div
        animate={{
          rotate: shape === 'square' ? 360 : 0,
          y: [0, -20, 0],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay },
        }}
        whileHover={{ scale: 1.3, opacity: 0.4 }}
      >
        {shape === 'ring' && (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="url(#g1)" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" stroke="url(#g1)" strokeWidth="1" opacity="0.5" />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        )}
        {shape === 'square' && (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <rect x="20" y="20" width="60" height="60" stroke="url(#g2)" strokeWidth="2" rx="12" />
            <rect x="35" y="35" width="30" height="30" stroke="url(#g2)" strokeWidth="1" rx="6" opacity="0.5" />
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        )}
        {shape === 'triangle' && (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <path d="M50 15 L85 80 L15 80 Z" stroke="url(#g3)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M50 35 L70 70 L30 70 Z" stroke="url(#g3)" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
            <defs>
              <linearGradient id="g3" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}

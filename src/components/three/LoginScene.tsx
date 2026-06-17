'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import with SSR disabled — Three.js requires the browser `window`
const Scene3D = dynamic(() => import('@/components/three/Scene3D'), {
  ssr: false,
  loading: () => null,
});

// ─── Static fallback for mobile / no-WebGL ─────────────────────
function StaticFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Gradient background mirroring the Three.js scene */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f0f23] to-[#050510]" />

      {/* Fallback floating shapes — CSS-only */}
      <div className="relative w-64 h-64">
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{
            left: '10%', top: '20%',
            background: 'radial-gradient(circle, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
          animate={{ y: [0, -15, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full"
          style={{
            left: '50%', top: '10%',
            background: 'radial-gradient(circle, #ec4899 0%, #be185d 100%)',
            boxShadow: '0 0 30px rgba(236,72,153,0.3)',
          }}
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute w-14 h-14 rounded-full"
          style={{
            left: '30%', top: '55%',
            background: 'radial-gradient(circle, #06b6d4 0%, #0891b2 100%)',
            boxShadow: '0 0 30px rgba(6,182,212,0.3)',
          }}
          animate={{ y: [0, -12, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>
    </div>
  );
}

// ─── WebGL detection hook ──────────────────────────────────────
function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

// ─── Login Scene wrapper ────────────────────────────────────────
interface LoginSceneProps {
  children?: React.ReactNode;
  className?: string;
}

export default function LoginScene({ children, className = '' }: LoginSceneProps) {
  const webglSupported = useWebGLSupport();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we should render Three.js or the fallback
  const showThree = mounted && webglSupported !== false;
  const showFallback = mounted && webglSupported === false;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Three.js Scene */}
      {showThree && (
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Scene3D />
        </div>
      )}

      {/* Static fallback for non-WebGL devices */}
      {showFallback && <StaticFallback />}

      {/* Loading placeholder while detecting WebGL */}
      {!mounted && (
        <div className="absolute inset-0 bg-[#0a0a1a]" />
      )}

      {/* Content overlay */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}

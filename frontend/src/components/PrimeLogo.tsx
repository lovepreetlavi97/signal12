import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const PrimeLogo: React.FC<{ size?: number; className?: string }> = ({ size, className = "" }) => {
  const style = size ? { width: size, height: size } : {};
  return (
    <div 
      className={`relative flex items-center justify-center overflow-visible bg-transparent border-none outline-none ${className}`} 
      style={style}
    >
      {/* 🏛️ The Core Identity */}
      <motion.div 
        className="relative z-10 flex items-center justify-center w-full h-full bg-transparent border-none"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Image 
          src="/logo.png" 
          alt="Logo" 
          fill
          className="object-contain mix-blend-screen brightness-110"
          priority
        />
      </motion.div>
    </div>
  );
};

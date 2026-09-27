import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

interface SfenLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SfenLogo: React.FC<SfenLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const iconSizeMap = {
    sm: 20,
    md: 28,
    lg: 40
  };

  return (
    <div id="sfen-logo-container" className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Hex/Shield Container */}
      <div className={`relative ${sizeMap[size]} rounded-lg bg-black border border-blue-600 p-2.5 flex items-center justify-center`}>
        {/* Central emblem: Shield with Docket & Lock layer */}
        <div className="relative flex items-center justify-center text-blue-500">
          <ShieldCheck size={iconSizeMap[size]} className="stroke-[1.8] text-blue-500" />
          <FileText size={iconSizeMap[size] * 0.45} className="absolute text-white -mt-1 stroke-[2.2]" />
        </div>

        {/* Small solid indicator without flashing */}
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-sm bg-blue-500" />
      </div>
    </div>
  );
};


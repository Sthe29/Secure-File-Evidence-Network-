import React from 'react';
import sapsBadge from '../assets/branding/saps-badge.png';

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

  return (
    <div id="sfen-logo-container" className={`flex items-center justify-center ${className}`}>
      <img
        src={sapsBadge}
        alt="South African Police Service badge"
        className={`${sizeMap[size]} object-contain`}
      />
    </div>
  );
};


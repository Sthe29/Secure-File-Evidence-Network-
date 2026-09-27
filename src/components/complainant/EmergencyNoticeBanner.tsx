import React from 'react';
import { AlertOctagon, PhoneCall } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EmergencyNoticeBannerProps {
  compact?: boolean;
}

export const EmergencyNoticeBanner: React.FC<EmergencyNoticeBannerProps> = () => {
  const { isDark } = useTheme();

  return (
    <div 
      id="emergency-advisory-banner"
      className={`w-full border-y py-2.5 px-4 flex items-center justify-between gap-3 text-xs ${
        isDark ? 'border-white/10 bg-black text-white' : 'border-black/10 bg-white text-black'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertOctagon size={16} className="text-blue-600 shrink-0" />
        <span>For active emergencies or crimes in progress, call <strong className="text-blue-600 font-bold">10111</strong> immediately.</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a 
          href="tel:10111" 
          className="px-3 py-1 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <PhoneCall size={12} />
          <span>Call 10111</span>
        </a>
      </div>
    </div>
  );
};


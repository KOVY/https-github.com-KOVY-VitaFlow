
import React from 'react';

interface MacroRingProps {
  current: number;
  target: number;
  color: string;
  label: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulseStatus?: 'normal' | 'low' | 'high'; // low = red pulse, high = green pulse
}

export const MacroRing: React.FC<MacroRingProps> = ({ current, target, color, label, size = 'md', pulseStatus = 'normal' }) => {
  const radius = size === 'sm' ? 18 : size === 'md' ? 28 : size === 'lg' ? 40 : 56;
  const stroke = size === 'sm' ? 3 : size === 'md' ? 4 : size === 'lg' ? 6 : 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const ratio = Math.min(current / target, 1);
  const strokeDashoffset = circumference - (ratio * circumference);
  
  const sizeClass = size === 'sm' ? 'w-12 h-12 text-xs' : size === 'md' ? 'w-20 h-20 text-sm' : size === 'lg' ? 'w-32 h-32 text-lg' : 'w-48 h-48 text-xl';

  // Dynamic Color Logic
  const progress = target > 0 ? current / target : 0;
  let dynamicColor = color;
  
  if (progress > 1.1) {
      dynamicColor = '#ef4444'; // Red-500 (Significantly Exceeded)
  } else if (progress >= 0.9) {
      dynamicColor = '#eab308'; // Yellow-500 (Nearing Target)
  }

  // Pulse Animation Wrapper Logic
  const pulseClass = pulseStatus === 'high' ? 'animate-flow-pulse-green' : pulseStatus === 'low' ? 'animate-flow-pulse-red' : '';
  const bgGlow = pulseStatus === 'high' ? 'bg-vital-500/10' : pulseStatus === 'low' ? 'bg-red-500/10' : 'bg-transparent';

  return (
    <div className={`relative ${sizeClass} flex items-center justify-center rounded-full ${pulseClass}`}>
      {/* Background Pulse Circle */}
      <div className={`absolute inset-0 rounded-full ${bgGlow} blur-xl transform scale-90`}></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] absolute"
        >
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: 0 }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-dark-700"
          />
          <circle
            stroke={dynamicColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="flex flex-col items-center justify-center z-20">
          <span className="font-bold">{current}</span>
          <span className="text-[10px] sm:text-xs text-gray-400 opacity-80 uppercase tracking-wide">{label}</span>
        </div>
      </div>
    </div>
  );
};

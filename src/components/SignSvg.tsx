import React from "react";
import { VIETNAM_ROAD_SIGNS } from "../data";

interface SignSvgProps {
  signId: string;
  size?: number | string;
  glow?: boolean;
}

export const SignSvg: React.FC<SignSvgProps> = ({ signId, size = 64, glow = false }) => {
  const glowStyle = glow 
    ? { filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))" } 
    : {};

  const getGlowColor = () => {
    if (signId.startsWith("P")) return "rgba(239, 68, 68, 0.4)"; // Red for Cấm
    if (signId.startsWith("W")) return "rgba(245, 158, 11, 0.4)"; // Orange/Yellow for Nguy hiểm
    if (signId.startsWith("R")) return "rgba(59, 130, 246, 0.4)"; // Blue for Hiệu lệnh
    return "rgba(16, 185, 129, 0.4)"; // Green or Cyan for others
  };

  const adaptiveGlow = glow 
    ? { filter: `drop-shadow(0 0 12px ${getGlowColor()})` } 
    : {};

  switch (signId) {
    case "P102": // Cấm đi ngược chiều (No Entry)
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle red */}
          <circle cx="50" cy="50" r="45" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
          {/* Inner white block */}
          <rect x="20" y="42" width="60" height="16" rx="2" fill="white" />
        </svg>
      );

    case "P127_60": // Hạn chế tốc độ 60km/h
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circle */}
          <circle cx="50" cy="50" r="45" fill="white" stroke="#EF4444" strokeWidth="9" />
          {/* Text 60 */}
          <text 
            x="50" 
            y="65" 
            fontFamily="monospace, sans-serif" 
            fontWeight="bold" 
            fontSize="42" 
            fill="black" 
            textAnchor="middle"
          >
            60
          </text>
        </svg>
      );

    case "P127_80": // Hạn chế tốc độ 80km/h
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circle */}
          <circle cx="50" cy="50" r="45" fill="white" stroke="#EF4444" strokeWidth="9" />
          {/* Text 80 */}
          <text 
            x="50" 
            y="65" 
            fontFamily="monospace, sans-serif" 
            fontWeight="bold" 
            fontSize="42" 
            fill="black" 
            textAnchor="middle"
          >
            80
          </text>
        </svg>
      );

    case "P130": // Cấm dừng xe và đỗ xe
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue inner, red border */}
          <circle cx="50" cy="50" r="45" fill="#1E40AF" stroke="#EF4444" strokeWidth="9" />
          {/* Red X */}
          <line x1="22" y1="22" x2="78" y2="78" stroke="#EF4444" strokeWidth="9" strokeLinecap="round" />
          <line x1="78" y1="22" x2="22" y2="78" stroke="#EF4444" strokeWidth="9" strokeLinecap="round" />
        </svg>
      );

    case "W205": // Đường giao nhau (warning)
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Triangle with red border, yellow background */}
          <path 
            d="M50 8 L93 83 C94.5 85.5 92.5 88 89.5 88 L10.5 88 C7.5 88 5.5 85.5 7 83 Z" 
            fill="#FBBF24" 
            stroke="#EF4444" 
            strokeWidth="8" 
            strokeLinejoin="round" 
          />
          {/* Intersection Black Cross */}
          <path d="M50 32 V70 M31 51 H69" stroke="black" strokeWidth="9" strokeLinecap="round" />
        </svg>
      );

    case "W224": // Đường người đi bộ qua đường (warning triangle)
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M50 8 L93 83 C94.5 85.5 92.5 88 89.5 88 L10.5 88 C7.5 88 5.5 85.5 7 83 Z" 
            fill="#FBBF24" 
            stroke="#EF4444" 
            strokeWidth="8" 
            strokeLinejoin="round" 
          />
          {/* Pedestrian symbol simplified */}
          <circle cx="50" cy="40" r="5" fill="black" />
          <path d="M50 45 L50 62 M42 54 L58 54 M44 72 L50 62 L56 72" stroke="black" strokeWidth="5" strokeLinecap="round" />
          {/* Crosswalk tracks */}
          <path d="M30 76 H70 M35 81 H65" stroke="black" strokeWidth="4" />
        </svg>
      );

    case "R301a": // Các hướng đi phải theo: Đi thẳng
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue circle */}
          <circle cx="50" cy="50" r="45" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          {/* Arrow pointing up */}
          <path d="M50 18 L30 38 M50 18 L70 38 M50 18 V80" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "R302a": // Hướng đi vòng chướng ngại vật - Vòng sang phải
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue circle */}
          <circle cx="50" cy="50" r="45" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          {/* Arrow pointing down-right diagonal */}
          <path d="M72 72 L36 72 M72 72 L72 36 M72 72 L24 24" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "I423a": // Vị trí người đi bộ cắt ngang (Guide square)
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue rectangle */}
          <rect x="5" y="5" width="90" height="90" rx="6" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="3" />
          {/* White inner triangle */}
          <path d="M50 15 L85 80 H15 Z" fill="white" />
          {/* Walking person black silhouette */}
          <circle cx="50" cy="38" r="4" fill="black" />
          <path d="M50 42 L50 58 M44 50 L56 50 M44 68 L50 58 L54 68" stroke="black" strokeWidth="5" strokeLinecap="round" />
          {/* Stripe bars beneath pedest */}
          <path d="M30 72 h40 M30 76 h40 M30 80 h40" stroke="blue" strokeWidth="2" />
        </svg>
      );

    default: {
      // Find the sign in our data to get the yoloLabel for the image
      const sign = VIETNAM_ROAD_SIGNS.find(s => s.id === signId);
      if (sign && sign.yoloLabel) {
        return (
          <img 
            src={`/reference/${encodeURIComponent(sign.yoloLabel)}.png`} 
            alt={sign.name}
            style={{ width: size, height: size, objectFit: 'contain', ...adaptiveGlow }}
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }

      // Unknown sign placeholder (highly futuristic outline)
      return (
        <svg 
          style={adaptiveGlow} 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="#1E293B" stroke="#00F0FF" strokeWidth="3" strokeDasharray="5,5" />
          <text 
            x="50" 
            y="56" 
            fontFamily="monospace, sans-serif" 
            fontSize="18" 
            fill="#00F0FF" 
            textAnchor="middle"
          >
            HUD AI
          </text>
        </svg>
      );
    }
  }
};

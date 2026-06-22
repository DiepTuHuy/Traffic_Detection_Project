export interface RoadSign {
  id: string; // e.g. P.127
  name: string; // Name in Vietnamese
  code: string; // e.g. P.127-60
  category: "cam" | "nguy-hiem" | "hieu-lenh" | "chi-dan"; 
  description: string; // Explanation of the sign
  imageUrl: string; // Relative or SVG string / external image URL
  speedLimit?: number; // Speed limit if applicable
  yoloLabel?: string; // Label from trained YOLO model, e.g. "Gioi han toc do 60km-h"
}

export interface RouteOption {
  id: string;
  name: string;
  description: string;
  weather: string;
  timeOfDay: string;
  scenarios: Array<{
    timestamp: number; // relative second in the simulation loop
    sign: RoadSign;
    distance: number; // initial distance in meters
    violationCheck?: boolean; // if speed limit violation should be triggered
  }>;
}

export interface HUDState {
  currentSpeed: number; // km/h
  targetSpeedLimit: number | null; // km/h
  engineRpm: number;
  engineTemp: number; // Celsius
  fuelLevel: number; // percentage
  gear: string; // D1, D2, P, R, etc.
  heading: string; // N, NE, E, SE, S, SW, W, NW
  latitude: number;
  longitude: number;
  altitude: number; // meters
  hasViolation: boolean;
  violationMessage: string;
  connectionLevel: number; // 0-4
}

export interface DetectionLog {
  id: string;
  timestamp: string; // HH:mm:ss
  signCode: string;
  signName: string;
  signCategory: string;
  confidence: number; // e.g. 98.7%
  distance: number; // meters
  wasViolated: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

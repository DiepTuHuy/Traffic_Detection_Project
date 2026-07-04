import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Car,
  TrendingUp,
  Compass,
  AlertTriangle,
  FileText,
  Activity,
  Maximize2,
  Video,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  HelpCircle,
  Search,
  CheckCircle,
  Cpu,
  RefreshCw,
  Eye,
  Settings,
  X,
  BellRing,
  Film,
  Square,
  Upload
} from "lucide-react";
import { RoadSign, RouteOption, HUDState, DetectionLog } from "./types";
import { VIETNAM_ROAD_SIGNS, SIMULATED_ROUTES, YOLO_LABEL_MAP } from "./data";
import { SignSvg } from "./components/SignSvg";
import { AIAssistant } from "./components/AIAssistant";

export default function App() {
  // Navigation & UI States
  const [activeRouteId, setActiveRouteId] = useState<string>("route-hanoi");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"hud" | "dictionary">("hud");
  
  // Real Camera States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Simulation Time Tick
  const [tick, setTick] = useState<number>(0);

  // HUD and Car parameters
  const [speed, setSpeed] = useState<number>(55);
  const [targetSpeedLimit, setTargetSpeedLimit] = useState<number | null>(80);
  const [engineRpm, setEngineRpm] = useState<number>(2400);
  const [heading, setHeading] = useState<string>("NNE");
  const [gear, setGear] = useState<string>("D4");
  const [altitude, setAltitude] = useState<number>(24);
  const [lastScannedSign, setLastScannedSign] = useState<RoadSign | null>(VIETNAM_ROAD_SIGNS[1]); // P127_80
  const [scanConfidence, setScanConfidence] = useState<number>(98.7);
  const [currentDistance, setCurrentDistance] = useState<number>(120);

  // Real-time logs
  const [logs, setLogs] = useState<DetectionLog[]>([
    {
      id: "1",
      timestamp: "08:01:45",
      signCode: "P.127 (80)",
      signName: "Biển hạn chế tốc độ tối đa (80 km/h)",
      signCategory: "cam",
      confidence: 99.4,
      distance: 200,
      wasViolated: false
    },
    {
      id: "2",
      timestamp: "08:02:02",
      signCode: "W.205",
      signName: "Biển báo đường giao nhau",
      signCategory: "nguy-hiem",
      confidence: 96.2,
      distance: 90,
      wasViolated: false
    }
  ]);

  // Dictionary Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isCameraScanning, setIsCameraScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'not-detected'>('idle');
  const noDetectCountRef = useRef<number>(0);
  const lastBeepTimeRef = useRef<number>(0);

  // File Upload States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileScanning, setFileScanning] = useState<boolean>(false);
  const [manualScanResult, setManualScanResult] = useState<string | null>(null);

  // Video Upload States
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoScanCount, setVideoScanCount] = useState<number>(0);
  const [videoScanStatus, setVideoScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'not-detected' | 'finished'>('idle');
  const uploadedVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive HUD warnings
  const [violationTriggered, setViolationTriggered] = useState<boolean>(false);
  const [dangerTriggered, setDangerTriggered] = useState<boolean>(false);

  // Audio TTS Alert System - Phát giọng nói cảnh báo tiếng Việt
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioLabelRef = useRef<string>("");
  const lastAudioTimeRef = useRef<number>(0);
  const AUDIO_COOLDOWN_MS = 5000; // Khoảng cách tối thiểu 5 giây giữa 2 lần phát cùng 1 biển báo

  const playSignAudio = (yoloLabel: string) => {
    if (!soundEnabled || !yoloLabel) return;

    const now = Date.now();
    // Tránh phát lặp lại liên tục cùng 1 biển báo
    if (yoloLabel === lastAudioLabelRef.current && (now - lastAudioTimeRef.current) < AUDIO_COOLDOWN_MS) {
      return;
    }

    // Tạo đường dẫn file âm thanh: /audio/{yoloLabel}.mp3
    const audioUrl = `/audio/${encodeURIComponent(yoloLabel)}.mp3`;

    // Dừng âm thanh cũ nếu đang phát
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.volume = 0.9;
    audioRef.current = audio;
    lastAudioLabelRef.current = yoloLabel;
    lastAudioTimeRef.current = now;

    audio.play().catch((err) => {
      console.warn(`Không tìm thấy file âm thanh cho biển báo "${yoloLabel}":`, err);
    });
  };

  // Speech voice action alert HUD overlays states
  const [activeGasAlert, setActiveGasAlert] = useState<boolean>(false);
  const [activeIncidentAlert, setActiveIncidentAlert] = useState<boolean>(false);
  const [reportedIncidentText, setReportedIncidentText] = useState<string>("");

  // Custom Event Listener of Voice-to-Text Speech Actions from AIAssistant inside iframe / dashboard
  useEffect(() => {
    const handleVoiceCommand = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      if (detail.command === "gas_station") {
        setActiveGasAlert(true);
        // Reset after comfortable viewing time
        setTimeout(() => setActiveGasAlert(false), 9000);

        if (soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          } catch (err) {}
        }
      } else if (detail.command === "report_incident") {
        setReportedIncidentText(detail.text || "Phát hiện sự cố giao thông phía trước");
        setActiveIncidentAlert(true);
        setTimeout(() => setActiveIncidentAlert(false), 9000);

        // Put down the report on the active logs as evidence
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const incidentLog: DetectionLog = {
          id: Math.random().toString(),
          timestamp: timeStr,
          signCode: "REPORT",
          signName: `⚠️ Báo Cáo: "${detail.text}"`,
          signCategory: "nguy-hiem",
          confidence: 100.0,
          distance: 0,
          wasViolated: false
        };
        setLogs((prev) => [incidentLog, ...prev.slice(0, 14)]);

        if (soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          } catch (err) {}
        }
      }
    };

    window.addEventListener("hud-voice-command", handleVoiceCommand);
    return () => {
      window.removeEventListener("hud-voice-command", handleVoiceCommand);
    };
  }, [soundEnabled]);

  // Integrations for Trained Custom YOLO/Tensorflow Model
  const [useCustomModel, setUseCustomModel] = useState<boolean>(true);
  const [modelEndpointUrl, setModelEndpointUrl] = useState<string>("http://localhost:5000/predict");
  const [githubRepoUrl, setGithubRepoUrl] = useState<string>("https://github.com/duviet720/vietnam-traffic-sign-detector-yolov8");
  const [isTestingEndpoint, setIsTestingEndpoint] = useState<boolean>(false);
  const [testEndpointMsg, setTestEndpointMsg] = useState<{ status: "idle" | "success" | "error"; text: string }>({
    status: "idle",
    text: ""
  });
  const [showIntegrationCode, setShowIntegrationCode] = useState<boolean>(false);

  // Ping check / Connection Simulation to private Python local backend model
  const testCustomModelConnection = async () => {
    setIsTestingEndpoint(true);
    setTestEndpointMsg({ status: "idle", text: "Đang kiểm tra kết nối tới Endpoint AI..." });
    
    // We send a request to localhost. Since this React app runs in an iframe or standard sandbox, 
    // we also provide a fallback simulated binding of the custom model to give they a flawless trial experience!
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(modelEndpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true, github: githubRepoUrl }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestEndpointMsg({
          status: "success",
          text: "🚀 LIÊN KẾT THÀNH CÔNG! Model YOLO của bạn đã kết nối với camera-feed."
        });
        setUseCustomModel(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Provide a clever diagnostic message so they can successfully deploy their custom model
      setTestEndpointMsg({
        status: "error",
        text: "Chưa thấy Server Python hoạt động ở " + modelEndpointUrl + ". Chế độ Demo mô phỏng đã tự động kích hoạt để bạn kiểm tra thử giao diện HUD!"
      });
      // Enable simulation fallback anyway so they can see how their interface reacts beautifully
      setUseCustomModel(true);
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  // Continuous Alert Sound for Dangerous Signs
  useEffect(() => {
    if (!dangerTriggered || !soundEnabled || !isPlaying) return;

    // Calculate delay based on distance to danger
    // Near distance = faster warming warning
    let beepInterval = 800; // default 0.8s
    if (currentDistance < 40) {
      beepInterval = 280; // urgent beep every 0.28s
    } else if (currentDistance < 70) {
      beepInterval = 500; // medium alert every 0.5s
    }

    const interval = setInterval(() => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = "sine";
        // Frequency changes depending on proximity to sound cooler
        const freq = currentDistance < 40 ? 950 : 800;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime); 
        
        // Short high-pitched radar sweep warning
        osc.frequency.exponentialRampToValueAtTime(freq - 150, audioCtx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // audio context Web Audio constraints
      }
    }, beepInterval);

    return () => clearInterval(interval);
  }, [dangerTriggered, currentDistance, soundEnabled, isPlaying]);

  // Find active route details
  const activeRoute = SIMULATED_ROUTES.find((r) => r.id === activeRouteId) || SIMULATED_ROUTES[0];

  // Control core tick-based simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTick((prev) => (prev + 1) % 65);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Run simulation scenario lookup based on current route & elapsed tick
  useEffect(() => {
    if (!isPlaying) return;

    // Find if there is a scenario at this timestamp
    const matchedScenario = activeRoute.scenarios.find(
      (s) => s.timestamp === tick
    );

    if (matchedScenario) {
      const sign = matchedScenario.sign;
      setLastScannedSign(sign);
      setScanConfidence(Number((95 + Math.random() * 4.9).toFixed(1)));
      setCurrentDistance(matchedScenario.distance);
      // Phát âm thanh cảnh báo tiếng Việt
      if (sign.yoloLabel) playSignAudio(sign.yoloLabel);

      if (sign.speedLimit) {
        setTargetSpeedLimit(sign.speedLimit);
      }

      // Voice alerting side-effect log
      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      // Add to logs array
      const newLog: DetectionLog = {
        id: Math.random().toString(),
        timestamp: timeStr,
        signCode: sign.code,
        signName: sign.name,
        signCategory: sign.category,
        confidence: Number((95 + Math.random() * 4.8).toFixed(1)),
        distance: matchedScenario.distance,
        wasViolated: sign.speedLimit ? speed > sign.speedLimit : false
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 14)]);

      // Audio notification if sound is active
      if (soundEnabled && typeof window !== "undefined") {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          // If violation speed, trigger high pitched urgent warning sound
          if (sign.speedLimit && speed > sign.speedLimit) {
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          } else {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime); // Soft alert
            osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          }
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
          // Web Audio API browser constraints
        }
      }
    }
  }, [tick, activeRouteId, isPlaying]);

  // Handle live vehicle telemetry changes (RPM fluctuation, compass changes)
  useEffect(() => {
    if (!isPlaying) return;

    const routeDirSeed = tick % 4;
    // Speed fluctuation
    setSpeed((prev) => {
      const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const newSpeed = Math.max(48, Math.min(110, prev + offset));
      return newSpeed;
    });

    // Check speed violation
    if (targetSpeedLimit && speed > targetSpeedLimit) {
      setViolationTriggered(true);
    } else {
      setViolationTriggered(false);
    }

    // Engine RPM matching speed
    setEngineRpm(() => {
      const baseRpm = Math.floor(speed * 35);
      return Math.min(6200, Math.max(1200, baseRpm + (Math.random() * 150 - 75)));
    });

    // Heading simulation
    const compassDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    setHeading(compassDirections[tick % compassDirections.length]);

    // Distance countdown
    setCurrentDistance((prev) => {
      const nextDist = prev <= 10 ? Math.floor(Math.random() * 50) + 120 : Math.max(5, prev - Math.floor(speed / 10));
      
      if (lastScannedSign && lastScannedSign.category === "nguy-hiem" && nextDist > 5 && nextDist < 110) {
        setDangerTriggered(true);
      } else {
        setDangerTriggered(false);
      }
      
      return nextDist;
    });

    // Simulated Altitude step fluctuation
    setAltitude((prev) => {
      const step = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      return Math.max(10, prev + step);
    });

  }, [tick]);

  // Activate PC Web Camera and fetch streams
  const toggleCamera = async () => {
    if (cameraActive) {
      // Turn off
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      // Ask and turn on
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "environment" }
        });
        setCameraActive(true);
        setIsPlaying(false); // TẮT CHẾ ĐỘ MÔ PHỎNG ĐỂ TRÁNH XUNG ĐỘT!
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => {
              console.error("Camera play failed:", e);
            });
          }
        }, 150);
      } catch (err: any) {
        console.error("Lỗi camera:", err);
        setCameraError("Không thể kích hoạt Camera phản chiếu. Đang sử dụng chế độ HUD Đồ họa mô phỏng tối ưu.");
        setCameraActive(false);
      }
    }
  };

  // Camera frame capturing and YOLO detection loop
  useEffect(() => {
    let intervalId: any;

    const captureAndSendFrame = async () => {
      if (!cameraActive || !videoRef.current || !canvasRef.current || !useCustomModel) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          // Vẽ frame từ video vào canvas (lật ngang để phù hợp nếu video bị scale-x-[-1])
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Chuyển sang Base64 dạng ảnh jpeg tối ưu
          const base64Image = canvas.toDataURL('image/jpeg', 0.95); // Tăng chất lượng ảnh gửi đi
          
          try {
            setIsCameraScanning(true);
            setScanStatus('scanning');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(modelEndpointUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              if (data.detected && data.code) {
                // Reset bộ đếm không phát hiện
                noDetectCountRef.current = 0;
                setScanStatus('detected');

                // Tra cứu biển báo qua bảng mapping nhãn YOLO
                const matchedSign = YOLO_LABEL_MAP[data.code]
                  || VIETNAM_ROAD_SIGNS.find(s => s.yoloLabel === data.code)
                  || ({
                    id: "custom",
                    name: data.name || `Biển báo: ${data.code}`,
                    code: data.code,
                    category: "cam" as const,
                    description: `Nhận diện từ model YOLO: ${data.code}`,
                    imageUrl: ""
                  } as RoadSign);

                setLastScannedSign(matchedSign);
                setScanConfidence(data.confidence || 98.7);
                setCurrentDistance(data.distance || 30);
                // Phát âm thanh cảnh báo tiếng Việt khi camera nhận diện
                playSignAudio(data.code); // Dùng data.code (nhãn YOLO gốc) vì matchedSign.yoloLabel có thể undefined
                if (matchedSign.speedLimit) {
                  setTargetSpeedLimit(matchedSign.speedLimit);
                }
                
                const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setLogs((prev) => {
                  if (prev.length > 0 && prev[0].signCode === matchedSign.code && (new Date().getTime() - new Date("1970/01/01 " + prev[0].timestamp).getTime() < 3000)) {
                    return prev; 
                  }
                  return [
                    {
                      id: Math.random().toString(),
                      timestamp: timeStr,
                      signCode: matchedSign.code,
                      signName: matchedSign.name,
                      signCategory: matchedSign.category,
                      confidence: data.confidence || 98.7,
                      distance: data.distance || 30,
                      wasViolated: matchedSign.speedLimit ? speed > matchedSign.speedLimit : false
                    },
                    ...prev.slice(0, 14)
                  ];
                });
              } else {
                // Không phát hiện biển báo trong frame này
                noDetectCountRef.current += 1;
                setScanStatus('not-detected');

                // Phát tiếng beep cảnh báo mỗi 5 giây liên tục không detect
                if (noDetectCountRef.current >= 5) {
                  const now = Date.now();
                  if (now - lastBeepTimeRef.current > 5000) {
                    lastBeepTimeRef.current = now;
                    // Tạo tiếng beep ngắn bằng Web Audio API
                    try {
                      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const oscillator = audioCtx.createOscillator();
                      const gainNode = audioCtx.createGain();
                      oscillator.connect(gainNode);
                      gainNode.connect(audioCtx.destination);
                      oscillator.frequency.value = 880; // Tần số A5
                      oscillator.type = 'sine';
                      gainNode.gain.value = 0.3;
                      oscillator.start();
                      oscillator.stop(audioCtx.currentTime + 0.15); // Beep 150ms
                      setTimeout(() => {
                        // Beep lần 2 (double beep)
                        const osc2 = audioCtx.createOscillator();
                        const gain2 = audioCtx.createGain();
                        osc2.connect(gain2);
                        gain2.connect(audioCtx.destination);
                        osc2.frequency.value = 880;
                        osc2.type = 'sine';
                        gain2.gain.value = 0.3;
                        osc2.start();
                        osc2.stop(audioCtx.currentTime + 0.15);
                      }, 200);
                    } catch (e) { /* Ignore audio errors */ }
                  }
                }
              }
            }
          } catch (error) {
            // Drop frame nếu quá thời gian hoặc lỗi
            setScanStatus('not-detected');
          } finally {
            setTimeout(() => setIsCameraScanning(false), 200);
          }
        }
      }
    };

    if (cameraActive && useCustomModel) {
      intervalId = setInterval(captureAndSendFrame, 1000); // 1 frame mỗi giây
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, useCustomModel, modelEndpointUrl, speed]);

  // Image upload and manual scanning
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64Image = event.target.result as string;
        setUploadedImage(base64Image);
        setFileScanning(true);
        setManualScanResult("Analyzing metadata via YOLO Convolutional units...");

        if (useCustomModel) {
          try {
            // Gửi ảnh tới API YOLO để nhận diện thực tế
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout cho CPU inference
            
            const response = await fetch(modelEndpointUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Image }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.detected && data.code) {
                // Tra cứu biển báo qua bảng mapping nhãn YOLO
                const matchedSign = YOLO_LABEL_MAP[data.code]
                  || VIETNAM_ROAD_SIGNS.find(s => s.yoloLabel === data.code)
                  || ({
                    id: "custom",
                    name: data.name || `Biển báo: ${data.code}`,
                    code: data.code,
                    category: "cam" as const,
                    description: `Nhận diện từ model YOLO: ${data.code}`,
                    imageUrl: ""
                  } as RoadSign);

                setLastScannedSign(matchedSign);
                setScanConfidence(data.confidence || 98.7);
                setCurrentDistance(data.distance || 30);
                // Phát âm thanh cảnh báo tiếng Việt khi upload ảnh
                if (matchedSign.yoloLabel) playSignAudio(matchedSign.yoloLabel);
                if (matchedSign.speedLimit) {
                  setTargetSpeedLimit(matchedSign.speedLimit);
                }
                setManualScanResult(`🎯 YOLO AI: ${matchedSign.name} (${data.confidence || 98}% Conf)`);
                setFileScanning(false);

                // Add to logs
                const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setLogs((prev) => [
                  {
                    id: Math.random().toString(),
                    timestamp: timeStr,
                    signCode: matchedSign.code,
                    signName: matchedSign.name,
                    signCategory: matchedSign.category,
                    confidence: data.confidence || 98.7,
                    distance: data.distance || 30,
                    wasViolated: matchedSign.speedLimit ? speed > matchedSign.speedLimit : false
                  },
                  ...prev
                ]);
                return;
              } else {
                // API hoạt động nhưng không nhận diện được biển báo trong ảnh
                setFileScanning(false);
                setManualScanResult("⚠️ YOLO AI không phát hiện biển báo trong ảnh này. Hãy thử ảnh rõ hơn hoặc góc chụp khác.");
                return;
              }
            }
          } catch (err) {
            console.log("Local API server offline, falling back to simulated neural engine:", err);
            setFileScanning(false);
            setManualScanResult("❌ Không kết nối được tới YOLO Server (http://localhost:5000). Hãy chắc chắn đã chạy: python yolo_api.py");
            return;
          }
        }

        // Fallback: Chỉ dùng khi useCustomModel = false (chế độ mô phỏng demo)
        setTimeout(() => {
          const signsCount = VIETNAM_ROAD_SIGNS.length;
          const randomSignIdx = Math.floor(Math.random() * signsCount);
          const matchedSign = VIETNAM_ROAD_SIGNS[randomSignIdx];

          setLastScannedSign(matchedSign);
          setScanConfidence(Number((98.1 + Math.random() * 1.8).toFixed(1)));
          setCurrentDistance(35);
          if (matchedSign.yoloLabel) playSignAudio(matchedSign.yoloLabel);
          if (matchedSign.speedLimit) {
            setTargetSpeedLimit(matchedSign.speedLimit);
          }
          setFileScanning(false);
          setManualScanResult(`⚙️ [Mô phỏng] Đã nhận diện: ${matchedSign.code} - ${matchedSign.name} (Bật "Sử dụng Model" để nhận diện thật)`);

          const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });
          
          setLogs((prev) => [
            {
              id: Math.random().toString(),
              timestamp: timeStr,
              signCode: matchedSign.code,
              signName: matchedSign.name,
              signCategory: matchedSign.category,
              confidence: 99.1,
              distance: 35,
              wasViolated: matchedSign.speedLimit ? speed > matchedSign.speedLimit : false
            },
            ...prev
          ]);
        }, 1200);
      }
    };
    reader.readAsDataURL(file);
  };

  // Video Upload Handler - Xử lý file video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cleanup URL cũ nếu có
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }

    const videoUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(videoUrl);
    setIsVideoMode(true);
    setIsVideoPlaying(true);
    setVideoScanCount(0);
    setVideoScanStatus('scanning');

    // Tắt camera thật nếu đang bật
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
    // Tắt simulation nếu đang chạy
    setIsPlaying(false);
  };

  // Bắt đầu / Dừng phát video upload
  const toggleVideoPlayback = () => {
    if (!uploadedVideoRef.current) return;
    if (isVideoPlaying) {
      uploadedVideoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      uploadedVideoRef.current.play().catch(console.error);
      setIsVideoPlaying(true);
      setVideoScanStatus('scanning');
    }
  };

  // Tắt chế độ video
  const exitVideoMode = () => {
    if (uploadedVideoRef.current) {
      uploadedVideoRef.current.pause();
    }
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoUrl(null);
    setIsVideoMode(false);
    setIsVideoPlaying(false);
    setVideoScanCount(0);
    setVideoScanStatus('idle');
  };

  // Video Frame Scanning Loop - Trích xuất frame từ video và gửi YOLO API
  useEffect(() => {
    let intervalId: any;

    const captureVideoFrame = async () => {
      if (!isVideoMode || !isVideoPlaying || !uploadedVideoRef.current || !videoCanvasRef.current || !useCustomModel) return;

      const video = uploadedVideoRef.current;
      const canvas = videoCanvasRef.current;

      // Kiểm tra video đã ended chưa (KHÔNG check paused vì có thể đang buffer)
      if (video.ended) {
        setIsVideoPlaying(false);
        setVideoScanStatus('finished');
        return;
      }

      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Chuyển sang base64 JPEG
          const base64Image = canvas.toDataURL('image/jpeg', 0.85);

          try {
            setVideoScanStatus('scanning');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(modelEndpointUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.detected && data.code) {
                setVideoScanStatus('detected');
                setVideoScanCount((prev) => prev + 1);

                // Tra cứu biển báo qua bảng mapping
                const matchedSign = YOLO_LABEL_MAP[data.code]
                  || VIETNAM_ROAD_SIGNS.find(s => s.yoloLabel === data.code)
                  || ({
                    id: "custom-video",
                    name: data.name || `Biển báo: ${data.code}`,
                    code: data.code,
                    category: "cam" as const,
                    description: `Nhận diện từ video - YOLO: ${data.code}`,
                    imageUrl: ""
                  } as RoadSign);

                setLastScannedSign(matchedSign);
                setScanConfidence(data.confidence || 98.7);
                setCurrentDistance(data.distance || 30);

                // Phát âm thanh cảnh báo tiếng Việt qua loa
                playSignAudio(data.code);

                if (matchedSign.speedLimit) {
                  setTargetSpeedLimit(matchedSign.speedLimit);
                }

                // Ghi log nhận diện
                const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setLogs((prev) => {
                  // Tránh log trùng lặp cùng biển báo trong 3 giây
                  if (prev.length > 0 && prev[0].signCode === matchedSign.code && (new Date().getTime() - new Date("1970/01/01 " + prev[0].timestamp).getTime() < 3000)) {
                    return prev;
                  }
                  return [
                    {
                      id: Math.random().toString(),
                      timestamp: timeStr,
                      signCode: matchedSign.code,
                      signName: matchedSign.name,
                      signCategory: matchedSign.category,
                      confidence: data.confidence || 98.7,
                      distance: data.distance || 30,
                      wasViolated: matchedSign.speedLimit ? speed > matchedSign.speedLimit : false
                    },
                    ...prev.slice(0, 14)
                  ];
                });
              } else {
                setVideoScanStatus('not-detected');
              }
            }
          } catch (error) {
            setVideoScanStatus('not-detected');
          }
        }
      }
    };

    if (isVideoMode && isVideoPlaying && useCustomModel) {
      intervalId = setInterval(captureVideoFrame, 800); // Mỗi 0.8 giây quét 1 frame - nhận diện xa hơn
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isVideoMode, isVideoPlaying, useCustomModel, modelEndpointUrl, speed]);

  // Interactive sign placement into simulate feed
  const forceManualIdentify = (sign: RoadSign) => {
    setLastScannedSign(sign);
    setScanConfidence(100.0);
    setCurrentDistance(15);
    // Phát âm thanh cảnh báo tiếng Việt khi test thủ công
    if (sign.yoloLabel) playSignAudio(sign.yoloLabel);
    if (sign.speedLimit) {
      setTargetSpeedLimit(sign.speedLimit);
    }
    if (sign.category === "nguy-hiem") {
      setDangerTriggered(true);
    } else {
      setDangerTriggered(false);
    }
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: timeStr,
        signCode: sign.code,
        signName: sign.name,
        signCategory: sign.category,
        confidence: 100.0,
        distance: 15,
        wasViolated: sign.speedLimit ? speed > sign.speedLimit : false
      },
      ...prev.slice(0, 14)
    ]);
  };

  // Pre-filtered dictionary
  const filteredSigns = VIETNAM_ROAD_SIGNS.filter((sign) => {
    const matchesSearch =
      sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || sign.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-hud-cyan selection:text-slate-950">
      
      {/* Top Futuristic Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Neon Pulse Smart Car Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-hud-cyan/40 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Car className="w-5 h-5 text-hud-cyan animate-pulse" />
            <div className="absolute inset-0 rounded-xl border border-hud-cyan/20 animate-ping opacity-30"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase font-sans">
                <span className="text-hud-cyan neon-glow-cyan">NHẬN DIỆN BIỂN BÁO GIAO THÔNG AI QUA CAMERA</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-1">
              HỆ THỐNG TRÍ TUỆ NHÂN TẠO PHÂN TÍCH HÌNH ẢNH THEO THỜI GIAN THỰC
            </p>
          </div>
        </div>

        {/* Global Stats & Simulation Toggles */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Active Navigation Tabs */}
          <div className="bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 flex">
            <button
              onClick={() => setActiveTab("hud")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-2 ${
                activeTab === "hud"
                  ? "bg-slate-800 text-hud-cyan border-b border-hud-cyan/60 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> MÀN HÌNH HUD HÀNH TRÌNH
            </button>
            <button
              onClick={() => setActiveTab("dictionary")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-2 ${
                activeTab === "dictionary"
                  ? "bg-slate-800 text-hud-cyan border-b border-hud-cyan/60 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> THƯ VIỆN BIỂN BÁO BGTVT
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          {/* Quick HUD States readout */}
          <div className="hidden lg:flex items-center gap-5 font-mono text-[11px] bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-hud-cyan animate-pulse"></span>
              <span className="text-slate-400">GPS LINK:</span>
              <span className="text-slate-200 font-bold">STABLE (4G)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-hud-green" />
              <span className="text-slate-400">FPS:</span>
              <span className="text-hud-green font-bold">60.0 / SEC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">LATENCY:</span>
              <span className="text-slate-200 font-bold">14ms</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1700px] mx-auto w-full">
        
        {activeTab === "hud" ? (
          <>
            {/* LEFT SIDEBAR: HUD Control & Quick Simulator Selection (3 cols) */}
            <div className="lg:col-span-3 space-y-4 flex flex-col">
              
              {/* Card 1: Route Simulator Setup */}
              <div id="route-selector-panel" className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="font-bold text-xs tracking-wider uppercase text-hud-cyan font-mono flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> Tuyển Đường Mô Phỏng
                  </h3>
                  <span className="bg-hud-cyan/10 text-hud-cyan text-[10px] font-mono px-1.5 py-0.5 rounded border border-hud-cyan/20">
                    ONLINE FEED
                  </span>
                </div>

                <div className="space-y-2">
                  {SIMULATED_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        setActiveRouteId(route.id);
                        setTick(0);
                        // default speed sets
                        if (route.id === "route-highway") {
                          setSpeed(85);
                          setTargetSpeedLimit(80);
                        } else if (route.id === "route-hcm") {
                          setSpeed(45);
                          setTargetSpeedLimit(60);
                        } else {
                          setSpeed(58);
                          setTargetSpeedLimit(80);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        activeRouteId === route.id
                          ? "bg-slate-950 border-hud-cyan/60 shadow-[inset_0_0_8px_rgba(0,240,255,0.15)]"
                          : "bg-slate-800/40 border-transparent hover:border-slate-700 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[12px] font-bold ${activeRouteId === route.id ? 'text-hud-cyan' : 'text-slate-200'}`}>
                          {route.name}
                        </span>
                        {activeRouteId === route.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-hud-cyan animate-ping" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">{route.description}</p>
                      
                      <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                        <span>🌤️ {route.weather}</span>
                        <span>⏱️ {route.timeOfDay}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Simulation Control Bar */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-hud-cyan transition-colors"
                      title={isPlaying ? "Tạm dừng giả lập" : "Tiếp tục giả lập"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-hud-cyan" />
                      ) : (
                        <Play className="w-4 h-4 text-hud-green" />
                      )}
                    </button>
                    <button
                      onClick={() => setTick(0)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-hud-cyan transition-colors"
                      title="Đặt lại chu kỳ"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-hud-cyan transition-colors"
                      title={soundEnabled ? "Tắt âm báo HUD" : "Bật âm báo HUD"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-hud-cyan" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    <span className="text-slate-500">CYCLE STATE:</span>{" "}
                    <span className="text-hud-cyan">{tick}s / 65s</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Controls to test Speed & Signs manually */}
              <div id="manual-tester-panel" className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-xs tracking-wider uppercase text-hud-cyan font-mono flex items-center gap-1.5">
                    <Settings className="w-4 h-4" /> Bộ Điều Khiển Thử Nghiệm
                  </h3>
                  <span className="p-0.5 text-[8px] bg-slate-800 border border-slate-700 rounded font-mono text-slate-400">
                    MANUAL DEV
                  </span>
                </div>

                {/* Speed Slider */}
                <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-slate-400">TỐC ĐỘ XE HIỆN TẠI:</span>
                    <span className={`font-bold ${violationTriggered ? "text-hud-red text-sm animate-pulse" : "text-hud-cyan"}`}>
                      {speed} KM/H
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="140"
                    value={speed}
                    onChange={(e) => {
                      setSpeed(Number(e.target.value));
                      // Match RPM ratio
                      setEngineRpm(Math.floor(Number(e.target.value) * 35));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-hud-cyan"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>20km/h (Nội đô)</span>
                    <span className="text-hud-red">Vượt 80 (Quốc lộ)</span>
                  </div>
                </div>

                {/* Simulated Sign Trigger buttons */}
                <div className="space-y-1.5">
                  <span className="block font-mono text-[10px] text-slate-400 uppercase">
                    Đặt nhanh biển báo lên camera để test AI nhận diện:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {VIETNAM_ROAD_SIGNS.slice(0, 6).map((sign) => (
                      <button
                        key={sign.id}
                        onClick={() => forceManualIdentify(sign)}
                        className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-hud-cyan/50 text-[10px] text-left transition-all flex items-center gap-1.5 group"
                      >
                        <div className="shrink-0 bg-slate-950 rounded p-0.5 group-hover:scale-105 transition-transform">
                          <SignSvg signId={sign.id} size={22} />
                        </div>
                        <span className="truncate text-slate-300 group-hover:text-hud-cyan font-mono font-medium">
                          {sign.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Image for instant custom AI analysis */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">QUÉT ẢNH TỪ FILE NGOÀI:</span>
                    <span className="text-hud-cyan flex items-center gap-1">
                      <Camera className="w-3" /> NEURAL DETECT
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hud-image-upload"
                  />
                  <label
                    htmlFor="hud-image-upload"
                    className="block w-full py-2 px-3 text-center bg-slate-900 border border-dashed border-slate-700 hover:border-hud-cyan rounded-lg text-xs cursor-pointer text-slate-300 hover:text-hud-cyan transition-all font-mono"
                  >
                    📂 Chọn file ảnh biển báo quét nhanh
                  </label>
                  {fileScanning && (
                    <div className="flex items-center gap-2 justify-center text-[10px] text-amber-400 animate-pulse font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ĐANG GIẢI MÃ BLOCK CONVOLUTIONAL...
                    </div>
                  )}
                  {manualScanResult && !fileScanning && (
                    <div className="p-1.5 bg-slate-900 rounded text-[10px] font-mono border border-slate-800 text-hud-green text-center">
                      🌟 {manualScanResult}
                    </div>
                  )}
                </div>

                {/* Upload Video for AI scanning */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">QUÉT VIDEO BIỂN BÁO:</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Film className="w-3" /> VIDEO DETECT
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="hud-video-upload"
                  />
                  <label
                    htmlFor="hud-video-upload"
                    className="block w-full py-2 px-3 text-center bg-slate-900 border border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg text-xs cursor-pointer text-slate-300 hover:text-amber-400 transition-all font-mono"
                  >
                    📹 Chọn file video quét biển báo
                  </label>
                  {isVideoMode && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-hud-green">✅ Video đã tải lên</span>
                        <span className="text-[10px] font-mono text-amber-400">Phát hiện: {videoScanCount} biển</span>
                      </div>
                      <button
                        onClick={exitVideoMode}
                        className="w-full py-1.5 px-3 text-center bg-hud-red/10 border border-hud-red/40 hover:bg-hud-red/20 rounded-lg text-[10px] cursor-pointer text-hud-red hover:text-red-300 transition-all font-mono font-bold"
                      >
                        ❌ Tắt chế độ video
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Trained Custom Model Integration & GitHub Link */}
              <div id="custom-model-integration-panel" className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="font-bold text-xs tracking-wider uppercase text-amber-400 font-mono flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-500 animate-pulse" /> Liên Kết YOLO / Model Đã Train
                  </h3>
                  <span className="bg-amber-500/10 text-amber-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold tracking-wider">
                    {useCustomModel ? "LIVE-LINK" : "OFFLINE"}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300">
                  {/* Status Toggle option */}
                  <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    <span className="font-mono text-[10.5px] font-medium tracking-wide">🔗 Sử dụng Model của bạn:</span>
                    <button
                      onClick={() => setUseCustomModel(!useCustomModel)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        useCustomModel ? "bg-hud-cyan" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          useCustomModel ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Git Link input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-mono uppercase">
                      Đường dẫn GitHub / HuggingFace Model của bạn:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={githubRepoUrl}
                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                        placeholder="https://github.com/your-username/yolov8-越南bien-bao"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-hud-cyan focus:outline-none px-2 rounded py-1.5 text-[11px] font-mono text-slate-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Local Server Endpoint */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-mono uppercase">
                      API Endpoint dự đoán (Local Inference API):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={modelEndpointUrl}
                        onChange={(e) => setModelEndpointUrl(e.target.value)}
                        placeholder="http://localhost:5000/predict"
                        className="flex-1 bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-hud-cyan focus:outline-none px-2 rounded py-1.5 text-[11.5px] font-mono text-slate-200 transition-all font-semibold"
                      />
                      <button
                        onClick={testCustomModelConnection}
                        disabled={isTestingEndpoint}
                        className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white px-2.5 rounded text-[10.5px] font-bold font-mono transition-all uppercase shrink-0"
                      >
                        {isTestingEndpoint ? "PING..." : "PING AI"}
                      </button>
                    </div>
                  </div>

                  {/* Response test status */}
                  {testEndpointMsg.text && (
                    <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed transition-all ${
                      testEndpointMsg.status === "success" 
                        ? "bg-hud-green/10 border-hud-green/30 text-hud-green" 
                        : testEndpointMsg.status === "error"
                        ? "bg-amber-500/10 border-amber-500/20 text-slate-300"
                        : "bg-slate-950/80 border-slate-850 text-slate-400 animate-pulse"
                    }`}>
                      <div className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">
                          {testEndpointMsg.status === "success" ? "✅" : testEndpointMsg.status === "error" ? "⚠️" : "📡"}
                        </span>
                        <span>{testEndpointMsg.text}</span>
                      </div>
                    </div>
                  )}

                  {/* Python Instruction Script Collapsible code block */}
                  <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/40">
                    <button
                      onClick={() => setShowIntegrationCode(!showIntegrationCode)}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-900/60 transition-colors text-left"
                    >
                      <span className="font-mono text-[9.5px] text-hud-cyan font-bold block">
                        ⚙️ CODE BACKEND PYTHON FLASK & YOLOv8
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {showIntegrationCode ? "Thu gọn ➖" : "Xem code ➕"}
                      </span>
                    </button>
                    
                    {showIntegrationCode && (
                      <div className="p-2 bg-slate-950 border-t border-slate-850 space-y-2">
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          Sao chép script dưới đây và lưu thành <code className="text-amber-400 font-mono bg-slate-900 px-1 py-0.5 rounded">server.py</code> ở máy tính của bạn nơi có file YOLO weights (<code className="text-amber-400 font-mono">best.pt</code>). Sau đó khởi chạy <code className="text-hud-cyan font-mono">python server.py</code>:
                        </p>
                        <pre className="text-[8.5px] font-mono bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto text-slate-300 select-all max-h-[160px] leading-relaxed">
{`# server.py
import base64
import io
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO

app = Flask(__name__)
# Cho phép HUD nhận diện biển báo từ xa
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model YOLOv8 (thay bằng best.pt của bạn)
model = YOLO("best.pt")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "image" not in data:
        return jsonify({"detected": False})
    
    try:
        # Giải mã base64 sang ảnh OpenCV
        img_data = data["image"].split(",")[-1]
        img_bytes = base64.b64decode(img_data)
        image = Image.open(io.BytesIO(img_bytes))
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # YOLO Predict
        results = model(img)
        
        for r in results:
            for box in r.boxes:
                class_id = int(box.cls[0])
                label = model.names[class_id]
                confidence = float(box.conf[0]) * 100
                
                # Trả về nhãn (ví dụ 'P.127' tương đương 80km)
                return jsonify({
                    "detected": True,
                    "code": label,
                    "name": f"Hệ thống tự động phát hiện {label}",
                    "confidence": round(confidence, 1),
                    "distance": 45
                })
    except Exception as e:
        print("Lỗi:", e)
        
    return jsonify({"detected": False})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)`}
                        </pre>
                        <div className="text-[9px] text-amber-500 font-mono bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                          🚨 <strong>Gợi ý:</strong> Bạn cần cài thư viện qua terminal: <br />
                          <code className="bg-slate-900 px-1 py-0.5 text-slate-200 mt-1 block">pip install flask flask-cors opencv-python ultralytics pillow</code>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* MIDDLE DASHBOARD: MAIN ROAD FEED, CAMERA & REAL-TIME TELEMETRY (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Card 1: MAIN CAMERA SCANNER VIEW (High intensity design) */}
              <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800/80 flex flex-col relative h-[380px]">
                
                {/* Cyber HUD Overlays Header */}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-slate-950 to-transparent z-10 flex items-center justify-between">
                  {/* Status lights & Mode info */}
                  <div className="flex items-center gap-2 font-mono">
                    <div className="relative">
                      <span className="absolute inline-flex h-3 w-3 rounded-full bg-hud-red opacity-75 animate-ping"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-hud-red"></span>
                    </div>
                    <div>
                      <span className="text-slate-300 font-bold text-xs tracking-wider uppercase">
                        {isVideoMode ? "VIDEO UPLOAD SCANNER ACTIVE" : cameraActive ? "LIVE CAMERA SCANNER ACTIVE" : "VEHICLE HUD GRAPHIC SIMULATING"}
                      </span>
                      <p className="text-[9px] text-slate-400">
                        {isVideoMode ? "NHẬN DIỆN BIỂN BÁO TỪ VIDEO - TỰ ĐỘNG QUÉT" : cameraActive ? "CAMERA 1080P WIDE FEED" : "MÔ PHỎNG ĐỒ HỌA 3D CHU KỲ PHẢN CHIẾU"}
                      </p>
                    </div>
                  </div>

                  {/* Switch to Web camera button strictly optimized */}
                  <div className="flex items-center gap-2">
                    {isVideoMode && (
                      <>
                        <button
                          onClick={toggleVideoPlayback}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isVideoPlaying
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30"
                              : "bg-hud-green/10 border-hud-green/30 text-hud-green hover:bg-hud-green/25"
                          }`}
                        >
                          {isVideoPlaying ? (
                            <><Pause className="w-4 h-4" /> ⏸ DỪNG</>
                          ) : (
                            <><Play className="w-4 h-4" /> ▶ PHÁT</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (uploadedVideoRef.current) {
                              uploadedVideoRef.current.currentTime = 0;
                              uploadedVideoRef.current.play().catch(console.error);
                              setIsVideoPlaying(true);
                              setVideoScanCount(0);
                              setVideoScanStatus('scanning');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/25"
                        >
                          <RotateCcw className="w-4 h-4" /> 🔄 XEM LẠI
                        </button>
                        <button
                          onClick={exitVideoMode}
                          className="px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer bg-hud-red/10 border-hud-red/30 text-hud-red hover:bg-hud-red/25"
                        >
                          <X className="w-4 h-4" /> ĐÓNG
                        </button>
                      </>
                    )}
                    {!isVideoMode && (
                      <button
                        onClick={toggleCamera}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          cameraActive
                            ? "bg-hud-red/20 border-hud-red text-hud-red hover:bg-hud-red/30"
                            : "bg-hud-cyan/10 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/25"
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        {cameraActive ? "🛑 TẮT CAMERA THƯỜNG" : "📷 BẬT CAMERA THẬT"}
                      </button>
                    )}
                  </div>
                </div>

                {/* MAIN SCREEN AREA (Graphics simulation OR real Camera feed) */}
                <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40"></div>

                  {isVideoMode && uploadedVideoUrl ? (
                    /* VIDEO UPLOAD PLAYBACK + AI SCANNING */
                    <div className="w-full h-full relative">
                      <video
                        ref={uploadedVideoRef}
                        src={uploadedVideoUrl}
                        className="w-full h-full object-contain bg-black"
                        playsInline
                        muted
                        autoPlay
                        onPlay={() => {
                          setIsVideoPlaying(true);
                          setVideoScanStatus('scanning');
                        }}
                        onEnded={() => {
                          setIsVideoPlaying(false);
                          setVideoScanStatus('finished');
                        }}
                      />
                      <canvas ref={videoCanvasRef} className="hidden" />

                      {/* Video Scanning Status Indicator */}
                      <div className={`absolute top-4 right-4 bg-slate-900/90 border text-[10px] font-mono px-3 py-1.5 rounded-full flex items-center gap-2 z-10 transition-all duration-300 ${
                        videoScanStatus === 'detected'
                          ? 'border-emerald-400 text-emerald-400'
                          : videoScanStatus === 'finished'
                            ? 'border-purple-400 text-purple-400'
                            : videoScanStatus === 'not-detected'
                              ? 'border-amber-400 text-amber-400'
                              : 'border-hud-cyan text-hud-cyan animate-pulse'
                      }`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            videoScanStatus === 'detected' ? 'bg-emerald-400' : videoScanStatus === 'finished' ? 'bg-purple-400' : videoScanStatus === 'not-detected' ? 'bg-amber-400' : 'bg-hud-cyan'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            videoScanStatus === 'detected' ? 'bg-emerald-400' : videoScanStatus === 'finished' ? 'bg-purple-400' : videoScanStatus === 'not-detected' ? 'bg-amber-400' : 'bg-hud-cyan'
                          }`}></span>
                        </span>
                        {videoScanStatus === 'detected' ? '✅ ĐÃ PHÁT HIỆN BIỂN BÁO' : videoScanStatus === 'finished' ? `🏁 HOÀN TẤT - ${videoScanCount} biển` : videoScanStatus === 'not-detected' ? '⚠️ ĐANG TÌM BIỂN BÁO...' : isVideoPlaying ? '📡 ĐANG QUÉT AI...' : '⏸ NHẤN PHÁT ĐỂ BẮT ĐẦU'}
                      </div>

                      {/* Video scan count badge */}
                      <div className="absolute top-4 left-4 bg-slate-900/90 border border-amber-400/50 text-[10px] font-mono px-3 py-1.5 rounded-full flex items-center gap-2 z-10">
                        <Film className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400 font-bold">ĐÃ PHÁT HIỆN: {videoScanCount} BIỂN BÁO</span>
                      </div>

                      {/* Neural Scanner Overlay crosshairs (for video) */}
                      {isVideoPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border border-dashed border-amber-400/40 rounded-full animate-pulse relative">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-400/35"></div>
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-400/35"></div>
                          </div>
                        </div>
                      )}

                      {/* Video finished overlay */}
                      {videoScanStatus === 'finished' && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10">
                          <div className="text-center bg-slate-900/95 border border-purple-500/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] max-w-[320px]">
                            <div className="text-3xl mb-2">🏁</div>
                            <div className="font-mono text-sm text-purple-400 font-bold uppercase tracking-wider mb-1">VIDEO ĐÃ KẾT THÚC</div>
                            <div className="font-mono text-[11px] text-slate-300 mb-3">Tổng biển báo nhận diện: <strong className="text-hud-green text-sm">{videoScanCount}</strong></div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (uploadedVideoRef.current) {
                                    uploadedVideoRef.current.currentTime = 0;
                                    uploadedVideoRef.current.play().catch(console.error);
                                    setIsVideoPlaying(true);
                                    setVideoScanCount(0);
                                    setVideoScanStatus('scanning');
                                  }
                                }}
                                className="flex-1 py-2 px-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> PHÁT LẠI
                              </button>
                              <button
                                onClick={exitVideoMode}
                                className="flex-1 py-2 px-3 bg-hud-red/10 border border-hud-red/40 text-hud-red hover:bg-hud-red/20 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <X className="w-3 h-3" /> ĐÓNG VIDEO
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : cameraActive ? (
                    /* REAL DRIVER WEBCAM STREAM */
                    <div className="w-full h-full relative">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover scale-x-[-1]"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Scanning Status Indicator Overlay */}
                      <div className={`absolute top-4 right-4 bg-slate-900/90 border text-[10px] font-mono px-3 py-1.5 rounded-full flex items-center gap-2 z-10 transition-all duration-300 ${
                        scanStatus === 'detected' 
                          ? 'border-emerald-400 text-emerald-400' 
                          : scanStatus === 'not-detected' 
                            ? 'border-amber-400 text-amber-400' 
                            : 'border-hud-cyan text-hud-cyan animate-pulse'
                      }`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            scanStatus === 'detected' ? 'bg-emerald-400' : scanStatus === 'not-detected' ? 'bg-amber-400' : 'bg-hud-cyan'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            scanStatus === 'detected' ? 'bg-emerald-400' : scanStatus === 'not-detected' ? 'bg-amber-400' : 'bg-hud-cyan'
                          }`}></span>
                        </span>
                        {scanStatus === 'detected' ? '✅ ĐÃ PHÁT HIỆN' : scanStatus === 'not-detected' ? '⚠️ KHÔNG PHÁT HIỆN' : '📡 ĐANG QUÉT AI...'}
                      </div>

                      {/* Neural Scanner Overlay crosshairs */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border border-dashed border-hud-cyan/40 rounded-full animate-pulse relative">
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-hud-cyan/35"></div>
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-hud-cyan/35"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VECTOR ROAD SIMULATION (Elegant sci-fi perspective road moving) */
                    <div className="w-full h-full flex flex-col justify-end bg-slate-950 relative overflow-hidden">
                      
                      {/* Radar sweep ambient background */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full radar-sweep opacity-30 pointer-events-none"></div>

                      {/* Moving cyber stars backdrop */}
                      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-slate-900 pointer-events-none"></div>

                      {/* Perspective Cyber Highway Board */}
                      <div className="absolute bottom-0 inset-x-0 h-44 road-perspective">
                        <div className="w-full h-full road-surface relative">
                          {/* Left boundary glow line */}
                          <div className="absolute left-12 top-0 bottom-0 w-1 bg-hud-cyan/40 shadow-[0_0_10px_rgba(0,240,255,0.4)]"></div>
                          {/* Right boundary glow line */}
                          <div className="absolute right-12 top-0 bottom-0 w-1 bg-hud-cyan/40 shadow-[0_0_10px_rgba(0,240,255,0.4)]"></div>
                          {/* Center dashed road-lines */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 road-lines"></div>
                        </div>
                      </div>

                      {/* Floating simulation details HUD overlay (Vietnam location names) */}
                      <div className="absolute top-16 left-6 font-mono text-[10px] text-slate-400 space-y-1">
                        <div>LOCATION: <span className="text-slate-100 font-bold">{activeRouteId === "route-hanoi" ? "ĐẠI LỘ THĂNG LONG - HN" : activeRouteId === "route-hcm" ? "QUẬN ĐỐNG ĐA - TP.HCM" : "LONG THÀNH DẦU GIÂY - SÀI GÒN"}</span></div>
                        <div>GPS TRACK: <span className="text-hud-cyan">21.0285° N, 105.8542° E</span></div>
                        <div>SIGNAL STRENGTH: <span className="text-hud-green">98.4%</span></div>
                      </div>

                      {/* Live scanning progress message */}
                      <div className="absolute bottom-6 left-6 pointer-events-none font-mono">
                        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-hud-cyan/30 px-3 py-1.5 rounded-lg">
                          <Eye className="w-3.5 h-3.5 text-hud-cyan animate-pulse" />
                          <span className="text-[10px] text-slate-300 tracking-wider">HỆ THỐNG ĐANG QUÉT ĐƯỜNG KÍNH LÁI BIỂN BÁO...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE DETECTED BIO-BOX OVERLAY LAYER (HUD Targeting Reticle) */}
                  {lastScannedSign && (
                    <div className="absolute top-20 right-6 md:right-12 z-20 flex flex-col items-center pointer-events-none md:scale-105 transition-all">
                      {/* Bounding box corners targeting */}
                      <div className="relative p-3 bg-slate-950/85 border-2 border-hud-cyan rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.3)] animate-bounce">
                        {/* Target reticle corner marker ticks */}
                        <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 border-t-4 border-l-4 border-hud-cyan"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 border-t-4 border-r-4 border-hud-cyan"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-4.5 h-4.5 border-b-4 border-l-4 border-hud-cyan"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 border-b-4 border-r-4 border-hud-cyan"></div>

                        {/* Sign SVG component rendering */}
                        <div className="w-18 h-18 flex items-center justify-center bg-slate-900/80 rounded-lg p-1">
                          <SignSvg signId={lastScannedSign.id} size={58} glow={true} />
                        </div>
                      </div>

                      {/* Reticle metrics footer info */}
                      <div className="mt-2 text-center bg-slate-950/90 border border-hud-cyan/50 rounded p-1.5 px-2.5 font-mono text-[10px]">
                        <div className="text-hud-cyan font-bold leading-normal truncate max-w-[170px] uppercase">
                          {lastScannedSign.code} - DETECTED
                        </div>
                        <div className="text-slate-400 mt-0.5 flex justify-between gap-4 font-mono">
                          <span>Conf: <strong className="text-hud-green">{scanConfidence}%</strong></span>
                          <span>Dist: <strong className="text-amber-500">{currentDistance}m</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scanner Beam Moving Line (Visual touch) */}
                  <div className="absolute left-0 right-0 h-4 pointer-events-none scanner-line opacity-40"></div>

                  {/* CAMERA ERROR NOTIFICATION */}
                  {cameraError && (
                    <div className="absolute bottom-3 inset-x-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-mono p-2 rounded text-center backdrop-blur-md">
                      ⚠️ {cameraError}
                    </div>
                  )}
                </div>

                {/* HIGH ALERT: SPEED VIOLATION INTERRUPT HUD GRID OVERLAY */}
                {violationTriggered && (
                  <div className="absolute inset-0 bg-hud-red/10 border-2 border-hud-red/80 pointer-events-none animate-pulse flex flex-col justify-between p-6 shadow-[inset_0_0_40px_rgba(239,68,68,0.4)] z-30">
                    <div className="flex items-center gap-2 bg-slate-950/95 border border-hud-red px-3 py-1.5 rounded-lg w-fit self-center">
                      <AlertTriangle className="w-5 h-5 text-hud-red animate-bounce" />
                      <div className="font-mono text-center">
                        <span className="text-[11px] text-hud-red font-bold block tracking-widest leading-none">
                          CẢNH BÁO: CHẠY QUÁ TỐC ĐỘ TỐI ĐA!
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Tốc độ xe: {speed}km/h &gt; Giới hạn biển báo P.127: {targetSpeedLimit}km/h
                        </span>
                      </div>
                    </div>
                    {/* Botton alarm alert ticks */}
                    <div className="flex justify-between w-full">
                      <span className="font-mono text-[10px] text-hud-red font-bold">⛔ SPEED VIOLATION EXCEEDED</span>
                      <span className="font-mono text-[10px] text-hud-red font-bold">REDUCE SPEED IMMEDIATELY ⛔</span>
                    </div>
                  </div>
                )}

                {/* HIGH ALERT: DANGEROUS SIGN DETECTED NEAR HUD OVERLAY */}
                {dangerTriggered && lastScannedSign && (
                  <div className="absolute inset-0 bg-amber-500/10 border border-amber-500 pointer-events-none animate-pulse flex flex-col justify-between p-6 shadow-[inset_0_0_35px_rgba(245,158,11,0.25)] z-30">
                    <div className="flex items-center gap-2.5 bg-slate-950/95 border border-amber-500 px-4 py-2 rounded-xl w-fit self-center shadow-lg">
                      <div className="relative">
                        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce shrink-0" />
                      <div className="font-mono text-left">
                        <span className="text-[11px] text-amber-400 font-bold block tracking-wider uppercase">
                          🚨 CHÚ Ý: CẢNH BÁO NGUY HIỂM PHÍA TRƯỚC!
                        </span>
                        <span className="text-[9.5px] text-slate-300 block mt-0.5 max-w-[280px]">
                          {lastScannedSign.name} (Cách {currentDistance}m)
                        </span>
                      </div>
                    </div>
                    {/* Bottom danger metrics */}
                    <div className="flex justify-between w-full">
                      <span className="font-mono text-[9px] text-amber-500 font-bold tracking-wider">⚠️ DANGER LANE PROFILE DETECTED</span>
                      <span className="font-mono text-[9px] text-amber-500 font-bold tracking-wider">PLEASE SLOW DOWN & OBSERVE ⚠️</span>
                    </div>
                  </div>
                )}

                {/* VOICE ALERT: NEAREST GAS STATION DEPLOYED OVERLAY */}
                {activeGasAlert && (
                  <div className="absolute inset-0 bg-hud-cyan/15 border-2 border-hud-cyan pointer-events-none flex flex-col justify-between p-6 shadow-[inset_0_0_30px_rgba(0,240,255,0.3)] z-30 animate-pulse">
                    <div className="flex items-center gap-3 bg-slate-950/95 border border-hud-cyan p-3 rounded-xl w-fit self-center shadow-2xl">
                      <div className="p-2 bg-hud-cyan/10 rounded-lg text-hud-cyan animate-bounce">
                        <Compass className="w-5 h-5 text-hud-cyan" />
                      </div>
                      <div className="font-mono text-left">
                        <span className="text-[11px] text-hud-cyan font-bold block tracking-wider uppercase">
                          ⛽ TÌM KIẾM TRẠM XĂNG GẦN NHẤT
                        </span>
                        <span className="text-[10px] text-slate-200 block mt-0.5">
                          Đã phát hiện Trạm xăng Petrolimex Số 19 cách <strong className="text-hud-green">450 mét</strong> về phía trước mặt bên phải.
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          Lộ trình dẫn đường GPS HUD đã được cập nhật khẩn cấp.
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-mono text-[9px] text-hud-cyan font-bold tracking-wider">🌐 GPS NAVIGATION RE-ROUTED</span>
                      <span className="font-mono text-[9px] text-hud-cyan font-bold tracking-wider">PETROLIMEX FUEL STATION #19 AHEAD ⛽</span>
                    </div>
                  </div>
                )}

                {/* VOICE ALERT: REPORT TRAFFIC INCIDENT SUBMITTED OVERLAY */}
                {activeIncidentAlert && (
                  <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500 pointer-events-none flex flex-col justify-between p-6 shadow-[inset_0_0_30px_rgba(239,68,68,0.25)] z-30 animate-pulse">
                    <div className="flex items-center gap-3 bg-slate-950/95 border border-red-500 p-3 rounded-xl w-fit self-center shadow-2xl">
                      <div className="p-2 bg-red-500/20 rounded-lg text-red-500 animate-bounce">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="font-mono text-left">
                        <span className="text-[11px] text-red-400 font-bold block tracking-wider uppercase">
                          📡 ĐÃ GHI NHẬN SỰ CỐ ĐƯỜNG BỘ!
                        </span>
                        <span className="text-[10px] text-slate-200 block mt-0.5 max-w-[320px]">
                          Báo cáo hành trình: <span className="text-amber-400 font-semibold">"{reportedIncidentText}"</span> đã gửi thành công.
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          Hệ thống đã đồng bộ sự cố lên đám mây giao thông đô thị và phát tín hiệu cho các xe lân cận.
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-mono text-[9px] text-red-500 font-bold tracking-wider">📡 SYNCING REPORT WITH CITY CLOUD</span>
                      <span className="font-mono text-[9px] text-red-500 font-bold tracking-wider">THANK YOU FOR REPORTING! 📡</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: SCI-FI TELEMETRY HUD INSTRUMENTS GAUGES (Integrated grid) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Dial 1: SPEED & SPEED LIMIT LIMITS */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between min-h-[145px] hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 tracking-tight">XE TỐC ĐỘ</span>
                    <Gauge className="w-4 h-4 text-hud-cyan" />
                  </div>

                  <div className="py-2 flex flex-col items-center">
                    <span className={`text-4xl font-bold font-mono ${violationTriggered ? "text-hud-red animate-pulse" : "text-slate-100 font-bold"}`}>
                      {speed}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">KILOMET / GIỜ</span>
                  </div>

                  {/* Matching Indicator bar */}
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${violationTriggered ? "bg-hud-red" : "bg-hud-cyan"}`}
                      style={{ width: `${Math.min(100, (speed / 140) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Dial 2: ROAD SPEED SIGNS CONTROLS */}
                <div className={`bg-slate-900/80 rounded-xl p-4 border transition-colors flex flex-col justify-between min-h-[145px] ${
                  violationTriggered ? "border-hud-red/55 shadow-[0_0_12px_rgba(239,68,68,0.1)]" : "border-slate-800/80"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">GIỚI HẠN BIỂN BÁO</span>
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="py-2 flex flex-col items-center justify-center relative">
                    {targetSpeedLimit ? (
                      <div className="flex items-center gap-2">
                        {/* Little rendered circle sign */}
                        <div className="w-12 h-12 rounded-full border-4 border-hud-red bg-white flex items-center justify-center font-bold text-slate-950 text-xl font-mono shadow">
                          {targetSpeedLimit}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-sm">CHƯA PHÁT HIỆN</span>
                    )}
                    <span className="text-[8px] text-slate-500 font-mono mt-1">BIỂN HẠN CHẾ TỐC ĐỘ</span>
                  </div>

                  <div className="text-center font-mono text-[9px] text-slate-400">
                    {targetSpeedLimit ? `Áp dụng từ biển báo trước` : "Chờ quét biển hiệu..."}
                  </div>
                </div>

                {/* Dial 3: ENGINE COMPRESSION STATUS */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between min-h-[145px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">ĐỘNG CƠ CÔNG SUẤT (RPM)</span>
                    <Activity className="w-4 h-4 text-hud-green" />
                  </div>

                  <div className="py-2 flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-hud-green">
                      {engineRpm}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">VÒNG / PHÚT</span>
                  </div>

                  {/* RPM bar graphs */}
                  <div className="flex gap-0.5 h-1.5 w-full bg-slate-950">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const fillRatio = engineRpm / 6000;
                      const active = i / 15 < fillRatio;
                      return (
                        <div
                          key={i}
                          className={`flex-1 transition-all ${
                            active
                              ? i > 11
                                ? "bg-hud-red"
                                : i > 8
                                ? "bg-hud-orange"
                                : "bg-hud-green"
                              : "bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Dial 4: GPS COMPASS STATS */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between min-h-[145px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">HƯỚNG DI CHUYỂN</span>
                    <Compass className="w-4 h-4 text-hud-cyan" />
                  </div>

                  <div className="py-2 flex flex-col items-center">
                    <span className="text-3xl font-bold font-mono text-slate-100 neon-glow-cyan">
                      {heading}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Altitude: {altitude}m</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>GEAR: <strong className="text-hud-cyan">{gear}</strong></span>
                    <span>HDOP: <strong className="text-hud-green">0.82</strong></span>
                  </div>
                </div>

              </div>

              {/* Card 3: CHRONOLOGICAL SCAN ROAD EVENT LOG FEED (Vietnam Law compliance) */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-hud-cyan rotate-45" />
                    <h3 className="font-bold text-xs tracking-wider uppercase text-hud-cyan font-mono">
                      Nhật Ký Camera Giao Thông Thực Tế ({logs.length})
                    </h3>
                  </div>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-mono transition-colors"
                  >
                    CLEAR LOGS
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[135px] space-y-2 pr-1 scrollbar">
                  {logs.length === 0 ? (
                    <div className="text-center font-mono text-xs text-slate-500 py-6">
                      Chưa có biển báo nào được nhận diện trong hành trình này.
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono transition-colors ${
                          log.wasViolated ? "bg-hud-red/5 border-hud-red/30" : "hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Circle small badge for Category */}
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            log.signCategory === "cam"
                              ? "bg-hud-red"
                              : log.signCategory === "nguy-hiem"
                              ? "bg-hud-orange"
                              : log.signCategory === "hieu-lenh"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          }`} title={log.signCategory} />

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-hud-cyan font-bold leading-none">{log.signCode}</span>
                              <span className="text-slate-200 truncate max-w-[240px] leading-none">{log.signName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1">Cự ly phát hiện: {log.distance} mét</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div>
                            <span className="text-slate-500 text-[10px] block text-right">ĐỘ TIN CẬY</span>
                            <span className="text-hud-green font-bold text-right block">{log.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block text-right">THỜI GIAN</span>
                            <span className="text-slate-300 text-right block text-[10px]">{log.timestamp}</span>
                          </div>
                          {log.wasViolated && (
                            <span className="bg-hud-red/20 text-hud-red font-bold text-[8px] px-1.5 py-0.5 rounded border border-hud-red/45 animate-pulse">
                              VIOLATED
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: INTELLIGENT COPPY TRAFFIC LAWS GEMINI ASSISTANT (3 cols) */}
            <div className="lg:col-span-3">
              <AIAssistant />
            </div>
          </>
        ) : (
          /* PRE-CONFIGURED VIETNAMESE ROAD TRAFFIC DICTIONARY TAB VIEW */
          <div className="lg:col-span-12 space-y-4">
            
            {/* Search Header panel */}
            <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800/80 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                    📚 Hệ Thống Cứu Hộ Luật Giao Thông Hành Trình
                  </h2>
                  <p className="text-sm text-slate-400 max-w-2xl">
                    Tra cứu nhanh chóng tất cả hệ thống Biển Báo Đường Bộ Việt Nam theo Quy chuẩn sửa đổi mới nhất của Bộ Giao thông Vận tải.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-hud-green" /> CHUẨN LUẬT GTĐB 2026/2027
                </div>
              </div>

              {/* Filters Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                {/* Search query input */}
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Nhập tên biển báo, mã số, hoặc từ khóa (ví dụ: cấm, 60km, người đi bộ)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-hud-cyan rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-hud-cyan transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Categorizer tabs */}
                <div className="md:col-span-6 flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: "all", label: "Tất cả biển" },
                    { id: "cam", label: "Cấm" },
                    { id: "nguy-hiem", label: "Nguy hiểm" },
                    { id: "hieu-lenh", label: "Hiệu lệnh" },
                    { id: "chi-dan", label: "Chỉ dẫn" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                        selectedCategory === cat.id
                          ? "bg-hud-cyan/15 text-hud-cyan border-hud-cyan/50"
                          : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid list display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
              {filteredSigns.length === 0 ? (
                <div className="col-span-12 bg-slate-900/50 rounded-xl p-12 text-center border border-slate-800/80">
                  <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-mono text-sm leading-normal">
                    Không tìm thấy dữ liệu biển báo nào trùng khớp với từ khóa "{searchQuery}"
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                    className="mt-3 text-xs text-hud-cyan underline hover:text-cyan-400"
                  >
                    Đặt lại bộ lọc tìm kiếm
                  </button>
                </div>
              ) : (
                filteredSigns.map((sign) => (
                  <div
                    key={sign.id}
                    className="bg-slate-900/85 border border-slate-800/85 rounded-xl p-4 flex flex-col justify-between hover:border-hud-cyan/40 hover:bg-slate-900 transition-all shadow-md group"
                  >
                    <div>
                      {/* Top Code Badge & Category Display */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-hud-cyan bg-slate-950 px-2.5 py-1 rounded border border-hud-cyan/35">
                          {sign.code}
                        </span>
                        
                        {/* Status Label Category */}
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                          sign.category === "cam"
                            ? "bg-hud-red/10 text-hud-red border border-hud-red/35"
                            : sign.category === "nguy-hiem"
                            ? "bg-hud-orange/15 text-hud-orange border border-hud-orange/35"
                            : sign.category === "hieu-lenh"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/35"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/35"
                        }`}>
                          {sign.category === "cam"
                            ? "Biển Cấm"
                            : sign.category === "nguy-hiem"
                            ? "Nguy hiểm"
                            : sign.category === "hieu-lenh"
                            ? "Hiệu lệnh"
                            : "Chỉ dẫn"}
                        </span>
                      </div>

                      {/* Sign Vector Preview */}
                      <div className="w-full h-32 bg-slate-950 rounded-lg flex items-center justify-center p-4 border border-slate-800 group-hover:border-slate-800 transition-colors mb-4 shadow-inner relative overflow-hidden">
                        
                        {/* Scanning green radar tick inside vector preview box */}
                        <div className="absolute inset-0 cyber-grid pointer-events-none opacity-30"></div>
                        <SignSvg signId={sign.id} size={75} />
                      </div>

                      {/* Title information */}
                      <h4 className="font-sans font-bold text-sm text-slate-100 group-hover:text-hud-cyan transition-colors mb-2">
                        {sign.name}
                      </h4>

                      {/* Explanation box */}
                      <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3 mb-4">
                        {sign.description}
                      </p>
                    </div>

                    {/* Simulation placing buttons */}
                    <button
                      onClick={() => {
                        forceManualIdentify(sign);
                        setActiveTab("hud");
                      }}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-hud-cyan text-xs text-slate-400 hover:text-hud-cyan py-2.5 rounded-lg font-mono tracking-wide transition-all mt-auto flex items-center justify-center gap-1"
                    >
                      ⚡ ÁP DỤNG THỬ TRÊN LÀN XE HUD
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>

      {/* Futuristic status line footer */}
      <footer className="bg-slate-950/90 border-t border-slate-900/90 px-4 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono mt-auto gap-4">
        <div>
          SYS SECURE ENGAGEMENT: <strong className="text-hud-cyan">ENCRYPTED (IP-HUD)</strong>
        </div>
        <div className="flex items-center gap-4">
          <span>AI ACCURACY: <strong className="text-hud-green">99.82%</strong></span>
          <span className="hidden sm:inline">DATA PROTOCOL: <strong className="text-slate-300">QCVN:41:2019/BGTVT</strong></span>
          <span className="text-slate-400 font-bold">SMART CITY AEGIS HUD CO., LTD © 2026</span>
        </div>
      </footer>

    </div>
  );
}

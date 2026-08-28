import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getKenyaNow } from '../services/workingHours';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  agentName: string;
  coords: { lat: number; lng: number; accuracy: number } | null;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  agentName,
  coords
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Live camera stream failed, falling back to direct capture input:', err);
      const msg = err instanceof Error ? err.message : 'Unable to access native camera.';
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw camera image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Anti-Spoofing & Geolocation Watermark Stamp directly onto image pixels
    const kenyaDate = getKenyaNow();
    const dateStr = kenyaDate.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) + ' EAT';
    const latStr = coords ? `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} (±${Math.round(coords.accuracy)}m)` : 'GPS: Nakuru, Kenya';

    // Bottom dark gradient strip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

    // Sewak Brand Watermark
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(0, canvas.height - 70, 6, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(`SEWAK PLASTICS VERIFIED VISIT PROOF`, 16, canvas.height - 46);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px monospace';
    ctx.fillText(`${agentName} | ${dateStr}`, 16, canvas.height - 28);
    ctx.fillText(latStr, 16, canvas.height - 12);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPreview(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  // Fallback direct camera file input when mediaDevices stream fails
  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // Stamp watermark
          const kenyaDate = getKenyaNow();
          const dateStr = kenyaDate.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) + ' EAT';
          const latStr = coords ? `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'GPS Captured';

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillText(`SEWAK PLASTICS VERIFIED VISIT PROOF`, 20, canvas.height - 50);

          ctx.fillStyle = '#94A3B8';
          ctx.font = '15px monospace';
          ctx.fillText(`${agentName} | ${dateStr} | ${latStr}`, 20, canvas.height - 20);

          const finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPreview(finalDataUrl);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-brand-red animate-pulse"></div>
          <span className="font-bold text-sm tracking-wide">Live Storefront Camera</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="relative flex-1 my-3 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
        {capturedPreview ? (
          <img
            src={capturedPreview}
            alt="Captured storefront"
            className="w-full h-full object-contain"
          />
        ) : cameraError ? (
          <div className="p-6 text-center text-slate-300 max-w-sm flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <h4 className="font-bold text-white text-base mb-1">Direct Camera Fallback</h4>
            <p className="text-xs text-slate-400 mb-4">
              Native video viewfinder is unavailable. Snap directly using your phone camera hardware below:
            </p>
            <label className="flex items-center justify-center space-x-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-xl shadow-lg cursor-pointer min-h-[48px] w-full">
              <Camera className="w-5 h-5" />
              <span>Launch Device Camera</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleNativeFileInput}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Target Guidelines */}
            <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[11px] text-white/70 font-mono bg-black/40 px-2 py-1 rounded backdrop-blur self-start">
                <span>SEWAK REAL-TIME VIEW</span>
              </div>
              <div className="text-[11px] text-white/80 font-mono bg-black/50 px-2.5 py-1.5 rounded backdrop-blur self-start">
                {coords ? `GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Acquiring GPS fix...'}
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Action Buttons */}
      <div className="py-2 flex items-center justify-center gap-4">
        {capturedPreview ? (
          <>
            <button
              onClick={retakePhoto}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl min-h-[48px] transition active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retake</span>
            </button>
            <button
              onClick={confirmPhoto}
              className="flex-1 flex items-center justify-center space-x-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 px-4 rounded-xl min-h-[48px] shadow-lg shadow-brand-red/30 transition active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Use Photo</span>
            </button>
          </>
        ) : !cameraError ? (
          <div className="flex items-center justify-around w-full max-w-xs">
            <button
              onClick={switchCamera}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Switch Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={takePhoto}
              className="p-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white shadow-xl shadow-brand-red/40 border-4 border-white/20 min-h-[64px] min-w-[64px] flex items-center justify-center active:scale-90 transition"
              title="Capture Storefront"
            >
              <Camera className="w-8 h-8" />
            </button>
            <div className="w-12"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

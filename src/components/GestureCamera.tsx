import { useEffect, useRef, useState } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

interface GestureCameraProps {
  onGestureDetected: (gesture: string) => void;
}

export const GestureCamera = ({ onGestureDetected }: GestureCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastGestureRef = useRef<string | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);

  const detectGesture = (landmarks: any[]) => {
    const now = Date.now();
    const triggerCooldown = 1000;

    // Get key landmarks
    const thumb_tip = landmarks[4];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const pinky_tip = landmarks[20];
    const wrist = landmarks[0];
    const index_mcp = landmarks[5];
    const middle_mcp = landmarks[9];
    const ring_mcp = landmarks[13];
    const pinky_mcp = landmarks[17];

    // Helper function to check if finger is extended
    const isFingerExtended = (tip: any, mcp: any, wrist: any) => {
      return tip.y < mcp.y && tip.y < wrist.y;
    };

    // Check individual fingers
    const indexExtended = isFingerExtended(index_tip, index_mcp, wrist);
    const middleExtended = isFingerExtended(middle_tip, middle_mcp, wrist);
    const ringExtended = isFingerExtended(ring_tip, ring_mcp, wrist);
    const pinkyExtended = isFingerExtended(pinky_tip, pinky_mcp, wrist);
    const thumbExtended = thumb_tip.x < landmarks[3].x;

    let currentGesture: string | null = null;

    // Pinch gesture (zoom)
    const dx_pinch = thumb_tip.x - index_tip.x;
    const dy_pinch = thumb_tip.y - index_tip.y;
    const pinchDistance = Math.sqrt(dx_pinch * dx_pinch + dy_pinch * dy_pinch);

    if (pinchDistance < 0.05 && !middleExtended && !ringExtended && !pinkyExtended) {
      currentGesture = "pinch_zoom";
    }
    // Open palm (all fingers extended)
    else if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      currentGesture = "open_palm";
    }
    // Peace sign (index and middle extended)
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      currentGesture = "peace_sign";
    }
    // Fist (no fingers extended)
    else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      currentGesture = "fist";
    }
    // Thumbs up
    else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumb_tip.y < wrist.y) {
      currentGesture = "thumbs_up";
    }
    // Pointing (only index extended)
    else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      currentGesture = "pointing";
    }

    if (
      currentGesture &&
      (currentGesture !== lastGestureRef.current ||
        now - lastTriggerTimeRef.current > triggerCooldown)
    ) {
      onGestureDetected(currentGesture);
      lastGestureRef.current = currentGesture;
      lastTriggerTimeRef.current = now;
    }
  };

  const onResults = (results: Results) => {
    if (!canvasRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw with neon colors
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00ffff",
        lineWidth: 3,
      });
      drawLandmarks(canvasCtx, landmarks, {
        color: "#ff00ff",
        lineWidth: 2,
        radius: 4,
      });

      detectGesture(landmarks);
    }

    canvasCtx.restore();
  };

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      setIsActive(true);
    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative w-full max-w-2xl mx-auto">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg neon-border"
          width={640}
          height={480}
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
            <button
              onClick={startCamera}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:scale-105 transition-transform shadow-neon"
            >
              Start Camera
            </button>
          </div>
        )}
      </div>
      {isActive && (
        <button
          onClick={stopCamera}
          className="mt-4 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:scale-105 transition-transform"
        >
          Stop Camera
        </button>
      )}
    </div>
  );
};

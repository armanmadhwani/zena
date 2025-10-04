import { useState, useEffect } from "react";
import { Hand, Maximize2, RotateCcw, ArrowUp, ArrowDown, ThumbsUp, MousePointer } from "lucide-react";

interface GestureStatusProps {
  currentGesture: string | null;
}

const gestureInfo: Record<string, { label: string; icon: any; description: string }> = {
  pinch_zoom: {
    label: "Pinch Zoom",
    icon: Maximize2,
    description: "Zooming in...",
  },
  open_palm: {
    label: "Open Palm",
    icon: Hand,
    description: "Reset zoom",
  },
  peace_sign: {
    label: "Peace Sign",
    icon: ArrowUp,
    description: "Scrolling up",
  },
  fist: {
    label: "Fist",
    icon: ArrowDown,
    description: "Scrolling down",
  },
  thumbs_up: {
    label: "Thumbs Up",
    icon: ThumbsUp,
    description: "Hello!",
  },
  pointing: {
    label: "Pointing",
    icon: MousePointer,
    description: "Pointer active",
  },
};

export const GestureStatus = ({ currentGesture }: GestureStatusProps) => {
  const [displayGesture, setDisplayGesture] = useState<string | null>(null);

  useEffect(() => {
    if (currentGesture) {
      setDisplayGesture(currentGesture);
      const timer = setTimeout(() => setDisplayGesture(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentGesture]);

  const info = displayGesture ? gestureInfo[displayGesture] : null;
  const Icon = info?.icon;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-card rounded-lg p-6 neon-border">
        <h2 className="text-xl font-bold mb-4 glow-text">Gesture Status</h2>
        
        {info ? (
          <div className="flex items-center gap-4 animate-glow-pulse">
            {Icon && <Icon className="w-8 h-8 text-primary" />}
            <div>
              <p className="text-lg font-semibold text-primary">{info.label}</p>
              <p className="text-muted-foreground">{info.description}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-muted-foreground">
            <Hand className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">No gesture detected</p>
              <p className="text-sm">Try one of the gestures below</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {Object.entries(gestureInfo).map(([key, value]) => {
          const GestureIcon = value.icon;
          return (
            <div
              key={key}
              className="bg-card rounded-lg p-4 border border-border hover:border-primary transition-colors"
            >
              <GestureIcon className="w-6 h-6 text-secondary mb-2" />
              <p className="font-medium text-sm">{value.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{value.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

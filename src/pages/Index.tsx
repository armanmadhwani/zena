import { useState, useEffect } from "react";
import { GestureCamera } from "@/components/GestureCamera";
import { GestureStatus } from "@/components/GestureStatus";
import { speak } from "@/utils/voiceFeedback";
import { Hand } from "lucide-react";

const Index = () => {
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    speak("Hello, ZENA is here to help you with gesture control");
  }, []);

  const handleGestureDetected = (gesture: string) => {
    setCurrentGesture(gesture);

    switch (gesture) {
      case "pinch_zoom":
        setZoomLevel((prev) => {
          const newZoom = Math.min(prev + 0.1, 2);
          document.body.style.zoom = newZoom.toString();
          return newZoom;
        });
        speak("Zooming in");
        break;

      case "open_palm":
        setZoomLevel(1);
        document.body.style.zoom = "1";
        speak("Zoom reset");
        break;

      case "peace_sign":
        window.scrollBy({ top: -200, behavior: "smooth" });
        speak("Scrolling up");
        break;

      case "fist":
        window.scrollBy({ top: 200, behavior: "smooth" });
        speak("Scrolling down");
        break;

      case "thumbs_up":
        speak("Hello there! Gesture control is active");
        break;

      case "pointing":
        speak("Pointer detected");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hand className="w-12 h-12 text-primary animate-float" />
            <h1 className="text-5xl font-bold glow-text">ZENA</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Gesture-Controlled Interface
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Use hand gestures to control your browser
          </p>
        </div>

        {/* Camera Feed */}
        <div className="mb-6">
          <GestureCamera onGestureDetected={handleGestureDetected} />
        </div>

        {/* Gesture Status */}
        <GestureStatus currentGesture={currentGesture} />

        {/* Info Card */}
        <div className="max-w-2xl mx-auto mt-8 bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-3 text-primary">How to use:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Pinch</strong> (thumb + index together) - Zoom in</li>
            <li>• <strong className="text-foreground">Open Palm</strong> (all fingers extended) - Reset zoom</li>
            <li>• <strong className="text-foreground">Peace Sign</strong> (index + middle up) - Scroll up</li>
            <li>• <strong className="text-foreground">Fist</strong> (all fingers closed) - Scroll down</li>
            <li>• <strong className="text-foreground">Thumbs Up</strong> - Voice greeting</li>
            <li>• <strong className="text-foreground">Pointing</strong> (index finger only) - Pointer mode</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Current zoom level: <span className="text-primary font-mono">{(zoomLevel * 100).toFixed(0)}%</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

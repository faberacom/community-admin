"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImage } from "@/src/utils/crop-image";
import { Button } from "@/src/components/ui/button";

interface ImageCropperProps {
  image: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({
  image,
  aspect = 1,
  cropShape = "rect",
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleAccept = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage(image, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      onCropComplete(croppedBlob, croppedUrl);
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      {/* Controls */}
      <div className="bg-black/90 px-4 py-4 sm:px-8 sm:py-6 space-y-4">
        {/* Zoom slider */}
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <span className="text-white text-xs">-</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-white text-xs">+</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={onCancel} className="min-w-24">
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="min-w-24"
          >
            {isProcessing ? "Processing..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}

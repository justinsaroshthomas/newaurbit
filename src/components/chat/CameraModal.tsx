'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Flashlight, Circle } from 'lucide-react';
import styles from './camera.module.css';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

export default function CameraModal({ onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    setLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setLoading(false);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High-res photo capture
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
            onClose();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.cameraContainer}>
        {loading && <div className={styles.loader}>Adjusting Lenses...</div>}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={styles.preview} 
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className={styles.controls}>
          <button className={styles.iconBtn} onClick={onClose}>
            <X size={24} />
          </button>
          
          <button className={styles.snapBtn} onClick={takePhoto}>
            <div className={styles.snapInner} />
          </button>
          
          <button className={styles.iconBtn} onClick={toggleCamera}>
            <RefreshCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

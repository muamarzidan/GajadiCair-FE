import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, RefreshCw, Check, AlertCircle, X } from 'lucide-react';

import { faceRecognitionApi } from '@/services/faceRecognition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


const MAX_ATTEMPTS = 3;
const CAPTURE_COUNT = 20;
const CAPTURE_DURATION = 3000; // 3 seconds

const FaceRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  
  // Security check: Only accessible from login flow
  useEffect(() => {
    if (!location.state?.fromLogin) {
      navigate('/', { replace: true });
    };
  }, [location, navigate]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera manually
  const startCamera = async () => {
    try {
      setError('');
      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      console.log('Camera access granted');
      setStream(mediaStream);
      setCameraStarted(true);
      
      // Wait for next render cycle so video element is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        throw new Error('Video element not found after render');
      }
      
      const video = videoRef.current;
      video.srcObject = mediaStream;
      
      // Play video
      await video.play();
      console.log('Video started playing');
      
      // Wait for video dimensions using requestAnimationFrame
      const waitForVideo = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeout = 10000; // 10 seconds max
          
          const checkDimensions = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              console.log('✅ Video ready:', video.videoWidth, 'x', video.videoHeight);
              resolve();
              return;
            }
            
            if (Date.now() - startTime > timeout) {
              reject(new Error('Timeout waiting for video dimensions'));
              return;
            }
            
            console.log('⏳ Waiting for video dimensions...');
            requestAnimationFrame(checkDimensions);
          };
          
          checkDimensions();
        });
      };
      
      await waitForVideo();
      
      // Additional small delay for stability
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🚀 Starting auto capture...');
      startAutoCapture();
      
    } catch (err: any) {
      console.error('❌ Camera start error:', err);
      setError(err.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
      setCameraStarted(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  // Auto capture 20 photos in 3 seconds
  const startAutoCapture = async () => {
    setIsCapturing(true);
    setError('');
    const capturedFiles: File[] = [];
    const intervalMs = CAPTURE_DURATION / CAPTURE_COUNT;

    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(0);

    // Capture frames
    for (let i = 0; i < CAPTURE_COUNT; i++) {
      const file = await captureFrame(i);
      if (file) {
        capturedFiles.push(file);
      } else {
        console.warn(`Failed to capture frame ${i}`);
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    console.log(`Captured ${capturedFiles.length} out of ${CAPTURE_COUNT} photos`);

    setCapturedImages(capturedFiles);
    setIsCapturing(false);

    // Process captured images - require at least 10 photos
    if (capturedFiles.length >= 10) {
      await processCaptures(capturedFiles);
    } else {
      handleFailedAttempt(`Hanya berhasil mengambil ${capturedFiles.length} foto. Minimal 10 foto diperlukan.`);
    }
  };

  const captureFrame = async (index: number): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Cannot get canvas context');
      return null;
    }

    // Check if video dimensions are valid
    if (!video.videoWidth || !video.videoHeight) {
      console.error('Video dimensions not ready:', video.videoWidth, video.videoHeight);
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
    });

    if (!blob) return null;

    return new File([blob], `face_${index}.jpg`, { type: 'image/jpeg' });
  };

  const processCaptures = async (files: File[]) => {
    if (files.length === 0) {
      handleFailedAttempt('Gagal mengambil foto. Silakan coba lagi.');
      return;
    }

    console.log(`Processing ${files.length} captured photos`);
    setIsProcessing(true);

    try {
      // Step 1: Check last photo
      const lastPhoto = files[files.length - 1];
      console.log('Checking last photo:', lastPhoto.name, lastPhoto.size);
      const checkResponse = await faceRecognitionApi.checkFace(lastPhoto);
      console.log('Check face response:', checkResponse);

      if (checkResponse.statusCode === 200 && checkResponse.data.has_face === true && checkResponse.data.count === 1) {
        // Step 2: Enroll all photos
        const enrollResponse = await faceRecognitionApi.enrollFace(files);

        if (enrollResponse.statusCode === 200 || enrollResponse.statusCode === 201) {
          setSuccess(true);
          
          // Stop camera
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }

          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          handleFailedAttempt('Gagal menyimpan data wajah. Silakan coba lagi.');
        }
      } else if (checkResponse.data.count === 0) {
        handleFailedAttempt('Wajah tidak terdeteksi. Pastikan wajah Anda terlihat jelas.');
      } else if (checkResponse.data.count > 1) {
        handleFailedAttempt('Terdeteksi lebih dari 1 wajah. Pastikan hanya wajah Anda yang terlihat.');
      } else {
        handleFailedAttempt('Gagal mendeteksi wajah. Silakan coba lagi.');
      }
    } catch (err: any) {
      handleFailedAttempt(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFailedAttempt = (message: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError(message);
    setCapturedImages([]);
    setCameraStarted(false);
    setCountdown(3);

    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (newAttempts >= MAX_ATTEMPTS) {
      // Max attempts reached - redirect to landing
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    };
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Face Detected!</h2>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </Card>
      </div>
    );
  };
  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Gagal Verifikasi</h2>
          <p className="text-muted-foreground mb-4">
            Anda telah mencapai batas maksimal percobaan ({MAX_ATTEMPTS}x). Coba lagi nanti.
          </p>
          <p className="text-sm text-muted-foreground">Mengalihkan ke halaman utama...</p>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="p-6 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Registrasi Wajah</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Percobaan: {attempts + 1} / {MAX_ATTEMPTS}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {/* Main Content */}
        <div className="space-y-4">
          {!cameraStarted ? (
            <>
              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                <p className="text-sm font-medium text-black mb-2">Sebelum mengambil foto, pastikan:</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Wajah Anda sudah didepan kamera</li>
                  <li>Wajah Anda terlihat dengan jelas</li>
                  <li>Pencahayaan yang cukup</li>
                  <li>Hindari backlight (cahaya dari belakang)</li>
                  <li>Hanya 1 wajah yang terlihat di kamera</li>
                </ul>
                <p className="text-sm font-medium text-black mt-3">Sistem akan mengambil 20 foto secara otomatis dalam 3 detik.</p>
                <p className="text-sm font-medium text-black">Jika sudah siap, tekan tombol "Buka Kamera" untuk memulai.</p>
              </div>
              {/* Action Button */}
              <Button
                onClick={startCamera}
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                <Camera className="h-5 w-5 mr-2" />
                Buka Kamera
              </Button>
            </>
          ) : (
            <>
              {/* Camera Preview */}
              <div className="relative bg-black/10 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Countdown Overlay */}
                {countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="text-white text-8xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
                {/* Capturing Indicator */}
                {isCapturing && countdown === 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Mengambil Foto...</span>
                  </div>
                )}
                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white font-medium">Memproses wajah Anda...</p>
                    </div>
                  </div>
                )}
                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              {/* Progress Info */}
              {isCapturing && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                  <p className="text-sm font-medium text-blue-700">
                    Foto diambil: {capturedImages.length} / {CAPTURE_COUNT}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FaceRegistrationPage;
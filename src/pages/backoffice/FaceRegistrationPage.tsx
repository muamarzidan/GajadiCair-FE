import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, RefreshCw, Check, AlertCircle, X } from 'lucide-react';

import { faceRecognitionApi } from '@/services/faceRecognition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


const MAX_ATTEMPTS = 3;

const FaceRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  
  // Security check: Only accessible from login flow
  useEffect(() => {
    if (!location.state?.fromLogin) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);
  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toDataURL('image/jpeg', 0.95);
    const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log("image url", imageUrl);
    setCapturedImage(imageUrl);
    setError('');
  };
  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
  };
  const submitPhoto = async () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setError('');

    try {
      const canvasToFileImage = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.95);
      });

      const file = new File([canvasToFileImage], 'face.jpg', { type: 'image/jpeg' });
      console.log("blog image", canvasToFileImage);  

      // Submit to API
      const response = await faceRecognitionApi.checkFace(file);

      if (response.statusCode === 200 && response.data.has_face && response.data.count === 1) {
        // Success - face detected
        setSuccess(true);
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else if (response.data.count === 0) {
        // No face detected
        handleFailedAttempt('Wajah tidak terdeteksi. Pastikan wajah Anda terlihat jelas.');
      } else if (response.data.count > 1) {
        // Multiple faces detected
        handleFailedAttempt('Terdeteksi lebih dari 1 wajah. Pastikan hanya wajah Anda yang terlihat.');
      } else {
        handleFailedAttempt('Gagal mendeteksi wajah. Silakan coba lagi.');
      }
    } catch (err: any) {
      handleFailedAttempt(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    };
  };
  const handleFailedAttempt = (message: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError(message);
    setCapturedImage(null);

    if (newAttempts >= MAX_ATTEMPTS) {
      // Max attempts reached - redirect to landing
      setTimeout(() => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Registrasi Wajah</h1>
          <p className="text-muted-foreground">
            Ambil foto wajah Anda dengan pencahayaan yang baik
          </p>
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
          {/* Camera/Image Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Tips:</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Pastikan wajah Anda terlihat jelas</li>
              <li>Gunakan pencahayaan yang cukup</li>
              <li>Hindari backlight (cahaya dari belakang)</li>
              <li>Hanya 1 wajah yang terlihat di kamera</li>
            </ul>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                className="flex-1"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Ambil Foto
              </Button>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  disabled={isProcessing}
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Ulangi
                </Button>
                <Button
                  onClick={submitPhoto}
                  className="flex-1"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FaceRegistrationPage;
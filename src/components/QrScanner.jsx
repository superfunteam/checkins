import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1,
};

export default function QrScanner({ onSuccess, onError, onClose }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const scannerId = 'qr-scanner-element';

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          SCANNER_CONFIG,
          (decodedText) => {
            if (isMounted) {
              // Stop scanner before calling success
              html5QrCode.stop().catch(console.error);
              onSuccess(decodedText);
            }
          },
          () => {
            // QR code not found - this is called frequently, ignore it
          }
        );

        if (isMounted) {
          setHasPermission(true);
          setIsStarting(false);
        }
      } catch (err) {
        console.error('Scanner error:', err);
        if (isMounted) {
          setHasPermission(false);
          setIsStarting(false);
          if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
            onError?.('Camera access required to scan QR codes');
          } else {
            onError?.(`Unable to start camera: ${err.message}`);
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {
          // Ignore errors on cleanup
        });
      }
    };
  }, [onSuccess, onError]);

  const handleClose = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error);
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center text-white hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex items-center justify-center relative">
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-8">
            <div className="text-center text-white max-w-sm">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-300 mb-4">
                Please allow camera access in your browser settings to scan QR codes.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div
          id="qr-scanner-element"
          ref={scannerRef}
          className="w-full max-w-md aspect-square"
        />

        {/* Viewfinder overlay */}
        {hasPermission && !isStarting && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 relative">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Footer instructions */}
      <div className="px-4 py-6 bg-black/80 text-center">
        <p className="text-white text-sm">
          Point your camera at the QR code displayed at the badge location
        </p>
      </div>
    </motion.div>
  );
}

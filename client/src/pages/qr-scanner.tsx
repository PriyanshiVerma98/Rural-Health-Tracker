import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  Camera,
  ExternalLink,
  Info,
  User,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";

export default function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scannedPatient, isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: ["/api/patients/qr", scannedCode],
    enabled: !!scannedCode,
    retry: false,
  });

  const { data: recentScans } = useQuery<Patient[]>({
    queryKey: ["/api/patients/recent-scans"],
    // Mock recent scans since we don't have this endpoint
    queryFn: () => Promise.resolve([]),
  });

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        // This is a placeholder for QR code scanning
        // In a real implementation, you would use a library like jsQR
        toast({
          title: "Camera Started",
          description: "Point your camera at a QR code to scan",
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      console.error("Camera access error:", error);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setScannedCode(manualCode.trim());
      setManualCode("");
    }
  };

  const clearScannedCode = () => {
    setScannedCode("");
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600">
          Scan patient QR codes to quickly access their health records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR Code Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Section */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Click to start scanning</p>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex space-x-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1 bg-medical-blue hover:bg-blue-700">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanner
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  Stop Scanner
                </Button>
              )}
            </div>

            {/* Manual Entry */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Or enter QR code manually:</p>
              <form onSubmit={handleManualSubmit} className="flex space-x-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code"
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  Submit
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {scannedCode ? (
              <div className="space-y-4">
                {isLoadingPatient ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : scannedPatient ? (
                  <div className="space-y-4">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-medium">
                        {scannedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{scannedPatient.name}</h3>
                        <p className="text-sm text-gray-600">ID: {scannedPatient.patientId}</p>
                        <Badge className="mt-1 text-xs bg-medical-blue text-white">
                          {scannedPatient.ageGroup}
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Age: {calculateAge(scannedPatient.dateOfBirth)}</span>
                      </div>
                      {scannedPatient.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{scannedPatient.phone}</span>
                        </div>
                      )}
                      {scannedPatient.gender && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{scannedPatient.gender}</span>
                        </div>
                      )}
                      {scannedPatient.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-xs">{scannedPatient.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link href={`/patients/${scannedPatient.id}`} className="flex-1">
                        <Button className="w-full bg-medical-blue hover:bg-blue-700">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Full Record
                        </Button>
                      </Link>
                      <Button onClick={clearScannedCode} variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No patient found with this QR code</p>
                    <p className="text-sm mt-2">Please verify the code and try again</p>
                    <Button onClick={clearScannedCode} variant="outline" className="mt-4">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Scan a QR code to get started</p>
                <p className="text-sm mt-2">Patient information will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-medical-blue mb-2 flex items-center">
              <Info className="mr-2 h-4 w-4" />
              QR Code Scanning Instructions
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ensure good lighting when scanning QR codes</li>
              <li>• Hold your device steady over the QR code</li>
              <li>• QR codes contain patient ID and basic information</li>
              <li>• Each patient receives a unique QR code on their health card</li>
              <li>• For privacy, QR codes don't contain sensitive medical data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Patient, Vaccination } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  QrCode,
  Edit,
  Phone,
  MapPin,
  Calendar,
  User,
  Syringe,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";

export default function PatientDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ["/api/patients", id],
    enabled: !!id,
  });

  const { data: vaccinations } = useQuery<Vaccination[]>({
    queryKey: ["/api/patients", id, "vaccinations"],
    enabled: !!id,
  });

  const updateVaccinationMutation = useMutation({
    mutationFn: async ({ vaccinationId, updates }: { vaccinationId: number; updates: any }) => {
      await apiRequest("PUT", `/api/vaccinations/${vaccinationId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients", id, "vaccinations"] });
      toast({
        title: "Success",
        description: "Vaccination updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vaccination",
        variant: "destructive",
      });
    },
  });

  const handleCompleteVaccination = (vaccinationId: number) => {
    updateVaccinationMutation.mutate({
      vaccinationId,
      updates: {
        status: "completed",
        administeredDate: new Date().toISOString().split('T')[0],
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-green text-white";
      case "scheduled":
        return "bg-medical-blue text-white";
      case "overdue":
        return "bg-error-red text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Link href="/patients">
          <Button className="mt-4">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/patients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-medium text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">Patient ID: {patient.patientId}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{patient?.name || 'Unknown Patient'}</h3>
                  <Badge className={`text-xs ${patient?.ageGroup === 'infant' ? 'bg-blue-100 text-blue-800' : 
                    patient?.ageGroup === 'child' ? 'bg-green-100 text-green-800' :
                    patient?.ageGroup === 'pregnant' ? 'bg-pink-100 text-pink-800' :
                    patient?.ageGroup === 'elderly' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {patient?.ageGroup || 'Unknown'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Age:</span>
                  <span>{calculateAge(patient?.dateOfBirth)} years</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Gender:</span>
                  <span>{patient?.gender || "N/A"}</span>
                </div>

                {patient?.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span>{patient.phone}</span>
                  </div>
                )}

                {patient?.address && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Address:</span>
                    <span className="text-xs">{patient.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {patient?.guardianName && (
            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Guardian Name</p>
                  <p className="font-medium">{patient.guardianName}</p>
                </div>
                {patient?.guardianPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Guardian Phone</p>
                    <p className="font-medium">{patient.guardianPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(patient?.medicalHistory || patient?.allergies) && (
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.medicalHistory && (
                  <div>
                    <p className="text-sm text-gray-600">Medical History</p>
                    <p className="text-sm">{patient.medicalHistory}</p>
                  </div>
                )}
                {patient.allergies && (
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="text-sm text-red-600">{patient.allergies}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vaccination History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vaccination History</CardTitle>
                <Button className="bg-health-green hover:bg-green-700">
                  <Syringe className="mr-2 h-4 w-4" />
                  Add Vaccination
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vaccinations?.length ? (
                <div className="space-y-4">
                  {vaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(vaccination.status)}
                            <span className="font-medium">Dose {vaccination.doseNumber}</span>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(vaccination.status)}`}>
                            {vaccination.status}
                          </Badge>
                        </div>
                        {vaccination.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteVaccination(vaccination.id)}
                            disabled={updateVaccinationMutation.isPending}
                            className="bg-success-green hover:bg-green-600"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Scheduled Date</p>
                          <p>{formatDate(vaccination.scheduledDate)}</p>
                        </div>
                        {vaccination.administeredDate && (
                          <div>
                            <p className="text-gray-600">Administered Date</p>
                            <p>{formatDate(vaccination.administeredDate)}</p>
                          </div>
                        )}
                      </div>

                      {vaccination.notes && (
                        <div className="mt-3">
                          <p className="text-gray-600 text-sm">Notes</p>
                          <p className="text-sm">{vaccination.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Syringe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No vaccination records found</p>
                  <p className="text-sm mt-2">Add the first vaccination record</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PatientForm } from "@/components/patient-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PatientNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await apiRequest("POST", "/api/patients", patientData);
      return response.json();
    },
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      setLocation(`/patients/${newPatient.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    createPatientMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/patients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Add New Patient</h1>
          <p className="text-gray-600">
            Create a new patient record and generate their digital health card
          </p>
        </div>
      </div>

      {/* Form */}
      <PatientForm
        onSubmit={handleSubmit}
        isLoading={createPatientMutation.isPending}
        submitText="Create Patient"
      />
    </div>
  );
}

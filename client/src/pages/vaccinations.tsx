import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vaccination, Patient, Vaccine } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Syringe,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Bell,
  Download,
  Filter,
} from "lucide-react";
import { Link } from "wouter";

interface VaccinationWithPatient extends Vaccination {
  patient: Patient;
  vaccine: Vaccine;
}

export default function Vaccinations() {
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaccinations, isLoading } = useQuery<VaccinationWithPatient[]>({
    queryKey: ["/api/vaccinations"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/vaccinations/stats"],
  });

  const updateVaccinationMutation = useMutation({
    mutationFn: async ({ vaccinationId, updates }: { vaccinationId: number; updates: any }) => {
      await apiRequest("PUT", `/api/vaccinations/${vaccinationId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vaccinations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vaccinations/stats"] });
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

  const filteredVaccinations = vaccinations?.filter((vaccination) => {
    if (ageGroupFilter !== "all" && vaccination.patient?.ageGroup !== ageGroupFilter) {
      return false;
    }
    if (statusFilter !== "all" && vaccination.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Vaccination Tracking</h1>
          <p className="text-gray-600">
            Monitor vaccination schedules and completion status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-health-green hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-green mb-1">
              {stats?.completed || 0}
            </div>
            <div className="text-sm text-gray-600">Completed Vaccinations</div>
            <div className="text-xs text-success-green mt-1">+12 this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-orange mb-1">
              {stats?.due || 0}
            </div>
            <div className="text-sm text-gray-600">Due This Week</div>
            <div className="text-xs text-warning-orange mt-1">3 urgent</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-error-red mb-1">
              {stats?.overdue || 0}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-xs text-error-red mt-1">Requires follow-up</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  <SelectItem value="infant">Infants (0-2)</SelectItem>
                  <SelectItem value="child">Children (2-18)</SelectItem>
                  <SelectItem value="pregnant">Pregnant Women</SelectItem>
                  <SelectItem value="elderly">Elderly (60+)</SelectItem>
                  <SelectItem value="adult">Adults</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vaccination Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVaccinations?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-900">Patient</th>
                    <th className="text-left p-3 font-medium text-gray-900">Age Group</th>
                    <th className="text-left p-3 font-medium text-gray-900">Vaccine</th>
                    <th className="text-left p-3 font-medium text-gray-900">Due Date</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVaccinations.map((vaccination) => (
                    <tr key={vaccination.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {vaccination.patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                          </div>
                          <div>
                            <div className="font-medium">{vaccination.patient?.name || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs">
                              ID: {vaccination.patient?.patientId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 capitalize">
                        {vaccination.patient?.ageGroup || 'N/A'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {vaccination.vaccine?.name || 'Unknown'} - Dose {vaccination.doseNumber}
                      </td>
                      <td className="p-3 text-gray-600">
                        {formatDate(vaccination.scheduledDate)}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs flex items-center space-x-1 w-fit ${getStatusColor(vaccination.status)}`}>
                          {getStatusIcon(vaccination.status)}
                          <span className="capitalize">{vaccination.status}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Link href={`/patients/${vaccination.patientId}`}>
                            <Button variant="ghost" size="sm" className="p-1 text-medical-blue hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {vaccination.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-success-green hover:bg-green-50"
                              onClick={() => handleCompleteVaccination(vaccination.id)}
                              disabled={updateVaccinationMutation.isPending}
                            >
                              <Syringe className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="p-1 text-gray-600 hover:bg-gray-50">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Syringe className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No vaccination records found</p>
              <p className="text-sm mt-2">
                {ageGroupFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Vaccination records will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

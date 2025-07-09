import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@shared/schema";
import {
  Search,
  Plus,
  QrCode,
  Eye,
  Phone,
  Calendar,
  Users,
} from "lucide-react";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: searchResults } = useQuery<Patient[]>({
    queryKey: ["/api/patients/search", searchQuery],
    enabled: searchQuery.length > 2,
    queryFn: () => fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
  });

  const displayPatients = searchQuery.length > 2 ? searchResults : patients;

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case "infant":
        return "bg-blue-100 text-blue-800";
      case "child":
        return "bg-green-100 text-green-800";
      case "pregnant":
        return "bg-pink-100 text-pink-800";
      case "elderly":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Patient Records</h1>
          <p className="text-gray-600">
            Manage and view all patient information
          </p>
        </div>
        <Link href="/patients/new">
          <Button className="bg-medical-blue hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, phone, or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPatients?.length ? (
          displayPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-medium">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                    </div>
                  </div>
                  <Badge className={getAgeGroupColor(patient.ageGroup)}>
                    {patient.ageGroup}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Age: {calculateAge(patient.dateOfBirth)}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Link href={`/patients/${patient.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="px-3">
                    <QrCode className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              {searchQuery.length > 2 ? (
                <>
                  <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No patients found matching "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No patients found</p>
                  <p className="text-sm mt-2">Get started by adding your first patient</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

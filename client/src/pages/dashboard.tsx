import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  Users,
  Syringe,
  CheckCircle,
  AlertTriangle,
  Plus,
  QrCode,
  Search,
  Calendar,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  totalPatients: number;
  completed: number;
  due: number;
  overdue: number;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  patientId: string;
}

interface Appointment {
  id: number;
  appointmentTime: string;
  type: string;
  patient: {
    name: string;
  };
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients", "recent"],
    select: (data: Patient[]) => data.slice(0, 5),
  });

  const { data: todayAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/today"],
  });

  const { data: searchResults } = useQuery<Patient[]>({
    queryKey: ["/api/patients/search", searchQuery],
    enabled: searchQuery.length > 2,
    queryFn: () => fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-green text-white";
      case "due":
        return "bg-warning-orange text-white";
      case "overdue":
        return "bg-error-red text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Health Worker Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}. Manage patient records and vaccination schedules.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link href="/patients/new">
            <Button className="bg-medical-blue hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </Link>
          <Link href="/qr-scanner">
            <Button className="bg-health-green hover:bg-green-700 w-full sm:w-auto">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalPatients || 0}
                </p>
              </div>
              <div className="bg-medical-blue bg-opacity-10 p-3 rounded-full">
                <Users className="text-medical-blue h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Vaccines</p>
                <p className="text-2xl font-semibold text-warning-orange">
                  {stats?.due || 0}
                </p>
              </div>
              <div className="bg-warning-orange bg-opacity-10 p-3 rounded-full">
                <Syringe className="text-warning-orange h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-success-green">
                  {stats?.completed || 0}
                </p>
              </div>
              <div className="bg-success-green bg-opacity-10 p-3 rounded-full">
                <CheckCircle className="text-success-green h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-error-red">
                  {stats?.overdue || 0}
                </p>
              </div>
              <div className="bg-error-red bg-opacity-10 p-3 rounded-full">
                <AlertTriangle className="text-error-red h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Search */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Patient Search & Records
                <Search className="h-5 w-5 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-3">
                {searchQuery.length > 2 && searchResults?.length ? (
                  searchResults.map((patient) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center text-white font-medium">
                            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                          </div>
                        </div>
                        <QrCode className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))
                ) : patients?.length ? (
                  patients.map((patient) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center text-white font-medium">
                            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                          </div>
                        </div>
                        <QrCode className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery.length > 2 ? "No patients found" : "No recent patients"}
                  </div>
                )}
              </div>

              <Link href="/patients">
                <Button variant="ghost" className="w-full text-medical-blue hover:text-blue-700">
                  View All Patients →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Today's Schedule
                <Calendar className="h-5 w-5 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAppointments?.length ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.appointmentTime}
                      </span>
                      <Badge className={`text-xs ${getStatusColor(appointment.type)}`}>
                        {appointment.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{appointment.patient?.name}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" className="flex-1 bg-success-green text-white text-xs hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No appointments today
                </div>
              )}

              <Link href="/appointments">
                <Button variant="ghost" className="w-full text-medical-blue hover:text-blue-700">
                  View Full Schedule →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

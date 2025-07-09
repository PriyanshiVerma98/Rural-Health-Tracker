import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Syringe,
  TrendingUp,
  FileText,
  Filter,
} from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("vaccination");
  const [timePeriod, setTimePeriod] = useState("current-month");
  const [format, setFormat] = useState("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: vaccinationStats } = useQuery({
    queryKey: ["/api/vaccinations/stats"],
  });

  interface StatsData {
    totalPatients: number;
    completed: number;
    due: number;
    overdue: number;
  }

  interface VaccinationStatsData {
    completed: number;
    due: number;
    overdue: number;
  }

  const statsData = stats as StatsData;
  const vaccinationStatsData = vaccinationStats as VaccinationStatsData;

  const downloadReport = async (endpoint: string, filename: string, reportFormat = 'csv') => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/reports/${endpoint}?format=${reportFormat}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReport = async () => {
    const reportEndpoints = {
      vaccination: 'vaccinations',
      demographics: 'demographics',
      overdue: 'overdue',
      monthly: 'monthly',
      patients: 'patients'
    };

    const endpoint = reportEndpoints[reportType as keyof typeof reportEndpoints];
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${reportType}_report_${currentDate}.${format}`;

    await downloadReport(endpoint, filename);
  };

  const availableReports = [
    {
      id: 1,
      title: "Patient List Report",
      description: "Complete list of all registered patients with demographics",
      type: "patients",
      endpoint: "patients",
    },
    {
      id: 2,
      title: "Vaccination Records Report",
      description: "All vaccination records with patient and vaccine details",
      type: "vaccinations",
      endpoint: "vaccinations",
    },
    {
      id: 3,
      title: "Overdue Vaccinations Report",
      description: "List of patients with overdue vaccination schedules",
      type: "overdue",
      endpoint: "overdue",
    },
    {
      id: 4,
      title: "Demographics Report",
      description: "Statistical breakdown by age group and gender",
      type: "demographics",
      endpoint: "demographics",
    },
    {
      id: 5,
      title: "Monthly Summary Report",
      description: "Monthly statistics and vaccination progress",
      type: "monthly",
      endpoint: "monthly",
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            Generate and view health statistics and reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-medical-blue hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsData?.totalPatients ?? 0}
                </p>
                <p className="text-xs text-success-green">+5.2% this month</p>
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
                <p className="text-sm text-gray-600">Vaccinations This Month</p>
                <p className="text-2xl font-semibold text-success-green">
                  {vaccinationStatsData?.completed ?? 0}
                </p>
                <p className="text-xs text-success-green">+12.3% vs last month</p>
              </div>
              <div className="bg-success-green bg-opacity-10 p-3 rounded-full">
                <Syringe className="text-success-green h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-medical-blue">94.2%</p>
                <p className="text-xs text-success-green">+2.1% improvement</p>
              </div>
              <div className="bg-medical-blue bg-opacity-10 p-3 rounded-full">
                <TrendingUp className="text-medical-blue h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Cases</p>
                <p className="text-2xl font-semibold text-error-red">
                  {vaccinationStatsData?.overdue ?? 0}
                </p>
                <p className="text-xs text-error-red">-8.1% vs last month</p>
              </div>
              <div className="bg-error-red bg-opacity-10 p-3 rounded-full">
                <Calendar className="text-error-red h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patients">Patient List</SelectItem>
                    <SelectItem value="vaccination">Vaccination Records</SelectItem>
                    <SelectItem value="demographics">Patient Demographics</SelectItem>
                    <SelectItem value="overdue">Overdue Vaccinations</SelectItem>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full bg-health-green hover:bg-green-700"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate & Download Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <Badge className="text-xs bg-success-green text-white">
                        Available
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Real-time data export
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadReport(report.endpoint, `${report.type}_report_${new Date().toISOString().split('T')[0]}.csv`, 'csv')}
                          disabled={isGenerating}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          {isGenerating ? "..." : "Download CSV"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadReport(report.endpoint, `${report.type}_report_${new Date().toISOString().split('T')[0]}.json`, 'json')}
                          disabled={isGenerating}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          {isGenerating ? "..." : "Download JSON"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Click any download button above to export reports</p>
                <p className="text-sm mt-2">All reports use real-time data from your system</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Chart visualization will be implemented here</p>
              <p className="text-sm mt-2">Showing vaccination trends over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

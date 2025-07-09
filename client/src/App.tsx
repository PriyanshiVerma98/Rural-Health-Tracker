import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSetup } from "@/hooks/useSetup";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

// Pages
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientNew from "@/pages/patient-new";
import PatientDetail from "@/pages/patient-detail";
import Vaccinations from "@/pages/vaccinations";
import QrScanner from "@/pages/qr-scanner";
import Admin from "@/pages/admin";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 pb-20 md:pb-4">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { needsSetup, isLoading: setupLoading } = useSetup();

  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={needsSetup ? Signup : Login} />
      </Switch>
    );
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={Patients} />
        <Route path="/patients/new" component={PatientNew} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/vaccinations" component={Vaccinations} />
        <Route path="/qr-scanner" component={QrScanner} />
        <Route path="/admin" component={Admin} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

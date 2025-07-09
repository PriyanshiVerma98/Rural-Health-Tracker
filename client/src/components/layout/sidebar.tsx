import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Users,
  Syringe,
  QrCode,
  BarChart3,
  Settings,
  UserCog,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patient Records", href: "/patients", icon: Users },
  { name: "Vaccination Tracker", href: "/vaccinations", icon: Syringe },
  { name: "QR Code Scanner", href: "/qr-scanner", icon: QrCode },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:block w-64 bg-white shadow-lg min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-medical-blue text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
          
          {user?.role === 'admin' && (
            <li>
              <Link href="/admin">
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  location === "/admin"
                    ? "bg-medical-blue text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <UserCog className="h-5 w-5" />
                  <span>User Management</span>
                </div>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

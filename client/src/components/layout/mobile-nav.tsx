import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Users,
  Syringe,
  QrCode,
  UserCog,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, label: "Dashboard" },
  { name: "Patients", href: "/patients", icon: Users, label: "Patients" },
  { name: "Vaccines", href: "/vaccinations", icon: Syringe, label: "Vaccines" },
  { name: "QR Scan", href: "/qr-scanner", icon: QrCode, label: "QR Scan" },
];

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [...navigation];
  
  if (user?.role === 'admin') {
    navItems.push({
      name: "Admin",
      href: "/admin",
      icon: UserCog,
      label: "Admin",
    });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center py-3 px-4 text-center transition-colors",
                isActive 
                  ? "text-medical-blue border-t-2 border-medical-blue" 
                  : "text-gray-500 hover:text-medical-blue"
              )}>
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

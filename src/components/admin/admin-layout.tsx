import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export type AdminTab = "dashboard" | "properties" | "inquiries" | "settings" | "profile";

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, onTabChange, children }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard" as AdminTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "properties" as AdminTab, label: "Properties", icon: Building2 },
    { id: "inquiries" as AdminTab, label: "Inquiries", icon: MessageSquare },
    { id: "settings" as AdminTab, label: "Settings", icon: Settings },
    { id: "profile" as AdminTab, label: "Profile", icon: User },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="dark min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between border-b border-white/15 bg-[#121215] px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
          </div>
          <span className="font-serif font-bold text-white text-base tracking-wider uppercase">
            Luxe Admin
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111114] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center shadow-lg shadow-[#d4af37]/10">
                <ShieldCheck className="h-5 w-5 text-[#d4af37]" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold tracking-wider text-white">
                  Kaur Tamandeep
                </h1>
                <p className="text-[10px] font-sans font-semibold tracking-widest text-[#d4af37] uppercase">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            <div className="px-3 pb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20"
                      : "text-zinc-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-black" : "text-zinc-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-[#d4af37] hover:bg-white/10 transition-colors font-medium"
          >
            <span>View Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#d4af37]/25 text-[#d4af37] flex items-center justify-center font-bold text-xs uppercase border border-[#d4af37]/40 shrink-0">
                {user?.email?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
                <p className="text-[10px] font-medium text-zinc-400">Authenticated Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 min-w-0">{children}</main>
    </div>
  );
};

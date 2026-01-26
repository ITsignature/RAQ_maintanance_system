import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Home,
  Calendar,
  Clipboard,
  Users,
  CreditCard,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Fish,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Bookings", href: "/bookings", icon: Clipboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  // { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "SMS", href: "/sms-logs", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Safe display values (prevents .charAt crashes)
  const displayName = user?.name || "User";
  const initial = (displayName.trim()[0] || "U").toUpperCase();
  const roleLabel =
    user?.role === 1
      ? "Super Admin"
      : user?.role === 2
      ? "Admin"
      : user?.role === 3
      ? "Staff"
      : user?.role === 4
      ? "Customer"
      : "User";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-950">
      {/* Top Navigation Bar */}
      <motion.div
        className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-b border-white/20 dark:border-white/10 fixed top-0 left-0 right-0 z-50 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-foreground"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-2 rounded-lg shadow-lg">
                <Fish className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg hidden sm:block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Aquarium System
              </span>
            </motion.div>
          </div>

          {/* Right - Notifications, User, Theme */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-white/50 dark:hover:bg-white/10"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                      <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
                        {unreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
              >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn("p-3", !notification.read && "bg-blue-50 dark:bg-blue-950")}
                    >
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-white/50 dark:hover:bg-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>

                  <motion.div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-medium shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    aria-label="User avatar"
                  >
                    {initial}
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-white/50 dark:hover:bg-white/10"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          <motion.aside
            initial={{ x: -264 }}
            animate={{ x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -264 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-16 left-0 bottom-0 w-64 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-r border-white/20 dark:border-white/10 overflow-y-auto z-40 shadow-xl"
            )}
          >
            <nav className="p-4 space-y-1">
              {navigation.map((item, index) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/" && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                          : "text-foreground hover:bg-white/50 dark:hover:bg-white/10 hover:text-cyan-600"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                          layoutId="activeIndicator"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/20 dark:border-white/10 mt-auto">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-red-50/50 dark:hover:bg-red-950/50 hover:text-red-600 hover:border-red-200 transition-all bg-white/30 dark:bg-white/5 border-white/30"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

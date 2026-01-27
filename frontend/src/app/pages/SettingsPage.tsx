import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { Plus, Users as UsersIcon, Mail, Phone, Shield, UserX, UserCheck } from "lucide-react";
import { motion } from "motion/react";

type UserRow = {
  id: number;
  name: string;
  phone_no: string;
  email: string | null;
  role: number; // 2 admin, 3 staff
  is_active: number; // 1/0
  created_at: string;
};

export function SettingsPage() {
  const { user } = useAuth();

  // Only admin/super can see this page
  const isAdmin = useMemo(() => user?.role === 1 || user?.role === 2, [user]);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_no: "",
    email: "",
    role: "3", // default Staff
    password: "",
  });

  const roleLabel = (r: number) => (r === 2 ? "Admin" : r === 3 ? "Staff" : "Unknown");

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const openDialog = () => {
    setForm({ name: "", phone_no: "", email: "", role: "3", password: "" });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleCreateUser = async () => {
    if (!form.name || !form.phone_no || !form.password) {
      toast.error("Name, phone number, and password are required");
      return;
    }

    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          phone_no: form.phone_no,
          email: form.email || null,
          password: form.password,
          role: Number(form.role), // 2 or 3
        }),
      });

      if (res.status === 409) return toast.error("Phone/email already exists");

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        return toast.error(msg?.message || "Failed to create user");
      }

      toast.success("User created");
      closeDialog();
      loadUsers();
    } catch {
      toast.error("Failed to create user");
    }
  };

  const deactivateStaff = async (id: number) => {
    try {
      const res = await apiFetch(`/api/users/${id}/deactivate`, { method: "PATCH" });
      const msg = await res.json().catch(() => null);
      if (!res.ok) return toast.error(msg?.message || "Failed to deactivate");
      toast.success("Staff deactivated");
      loadUsers();
    } catch {
      toast.error("Failed to deactivate");
    }
  };

  const activateStaff = async (id: number) => {
    try {
      const res = await apiFetch(`/api/users/${id}/activate`, { method: "PATCH" });
      const msg = await res.json().catch(() => null);
      if (!res.ok) return toast.error(msg?.message || "Failed to activate");
      toast.success("Staff activated");
      loadUsers();
    } catch {
      toast.error("Failed to activate");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Only admins can manage users.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" /> Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Create and manage Admin and Staff accounts
        </p>
      </motion.div>

      {/* Add User Button - Mobile Fixed */}
      <div className="flex justify-end">
        <Button onClick={openDialog} className="w-full sm:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          {/* <CardDescription>Admins (role 2) and Staff (role 3)</CardDescription> */}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const isStaff = u.role === 3;
                    const isAdminRow = u.role === 2;

                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.phone_no}</TableCell>
                        <TableCell>{u.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 2 ? "default" : "outline"}>
                            {roleLabel(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.is_active ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {isAdminRow ? (
                            <span className="text-muted-foreground text-sm">—</span>
                          ) : isStaff ? (
                            u.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deactivateStaff(u.id)}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => activateStaff(u.id)}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Reactivate
                              </Button>
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No users found
            </CardContent>
          </Card>
        ) : (
          users.map((u) => {
            const isStaff = u.role === 3;
            const isAdminRow = u.role === 2;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{u.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={u.role === 2 ? "default" : "outline"}>
                            <Shield className="w-3 h-3 mr-1" />
                            {roleLabel(u.role)}
                          </Badge>
                          {u.is_active ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-3">
                    {/* Phone */}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{u.phone_no}</span>
                    </div>

                    {/* Email */}
                    {u.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{u.email}</span>
                      </div>
                    )}

                    {/* Actions */}
                    {isStaff && (
                      <div className="pt-2 border-t">
                        {u.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateStaff(u.id)}
                            className="w-full"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate Staff
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateStaff(u.id)}
                            className="w-full"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Reactivate Staff
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create an Admin or Staff account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0771234567"
                value={form.phone_no}
                onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" />
                      <span>Staff</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleCreateUser} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
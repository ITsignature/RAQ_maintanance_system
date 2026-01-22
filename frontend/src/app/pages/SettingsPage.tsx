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
import { Plus, Users as UsersIcon } from "lucide-react";
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
    <div className="space-y-6 p-0">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7" /> Users
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Create and manage Admin and Staff accounts
        </p>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>Admins (role 2) and Staff (role 3)</CardDescription>
          </div>

          <Button onClick={openDialog} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile friendly: horizontal scroll */}
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
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
                        <TableCell className="hidden md:table-cell">
                          {u.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === 2 ? "default" : "outline"}>
                            {roleLabel(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-800">Inactive</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {/* Admin accounts: no deactivate/reactivate */}
                          {isAdminRow ? (
                            <span className="text-muted-foreground text-sm">—</span>
                          ) : isStaff ? (
                            u.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deactivateStaff(u.id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => activateStaff(u.id)}
                              >
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

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create an Admin or Staff account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={form.phone_no}
                onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Admin</SelectItem>
                  <SelectItem value="3">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

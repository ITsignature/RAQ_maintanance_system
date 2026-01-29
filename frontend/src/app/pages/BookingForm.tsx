import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, AlertCircle, X } from "lucide-react";
import { useLocation } from "react-router-dom";


type Staff = { id: number; name: string; phone_no: string };
type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string | null;
  loyalty_number?: string | null;
};

export function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // -------- staff (fetch on load)
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  // -------- customers (lazy search)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // UI state
  const [conflict, setConflict] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerId: "",
    staffIds: [] as string[],
    date: "",
    startTime: "",
    endTime: "",
    serviceName: "",
    notes: "",
    totalAmount: "",
  });

  // Refs for click outside
  const staffDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // ======= helpers
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setConflict(null);
  };

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.id) === formData.customerId),
    [customers, formData.customerId]
  );

  const selectedStaff = useMemo(() => {
    const set = new Set(formData.staffIds);
    return staffList.filter((s) => set.has(String(s.id)));
  }, [staffList, formData.staffIds]);

  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return staffList;
    const q = staffSearchQuery.toLowerCase();
    return staffList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.phone_no.includes(q)
    );
  }, [staffList, staffSearchQuery]);

  const toggleStaff = (id: string) => {
    console.log("👆 Toggle staff clicked:", id);
    setConflict(null);
    setFormData((prev) => {
      const exists = prev.staffIds.includes(id);
      const newStaffIds = exists ? prev.staffIds.filter((x) => x !== id) : [...prev.staffIds, id];
      return { ...prev, staffIds: newStaffIds };
    });
  };

  const removeStaff = (id: string) => {
    setConflict(null);
    setFormData((prev) => ({ ...prev, staffIds: prev.staffIds.filter((x) => x !== id) }));
  };

  // ======= fetch staff on load
  useEffect(() => {
    (async () => {
      try {
        console.log("🔄 Fetching staff list...");
        setStaffLoading(true);
        const res = await apiFetch("/api/users/staff");
        console.log("📡 Staff API response status:", res.status);
        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          console.error("❌ Staff API error:", msg);
          throw new Error(msg?.message || "Failed to load staff");
        }
        const data = await res.json();
        console.log("✅ Staff data received:", data);
        setStaffList(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("❌ Staff fetch error:", e);
        toast.error(e?.message || "Failed to load staff");
        setStaffList([]);
      } finally {
        setStaffLoading(false);
        console.log("✅ Staff loading complete");
      }
    })();
  }, []);

  useEffect(() => {
  const prefill = location?.state?.prefillCustomer;
  if (!prefill?.id) return;

  // select customer
  setFormData((prev) => ({ ...prev, customerId: String(prefill.id) }));

  // show name in input box
  setCustomerQuery(prefill.name);

  // ensure selectedCustomer works (it searches in `customers`)
  setCustomers((prev) => {
    const exists = prev.some((c) => c.id === prefill.id);
    return exists ? prev : [prefill, ...prev];
  });

  // close dropdown
  setShowCustomerDropdown(false);

  // clear state so it doesn't re-run on refresh
  navigate(".", { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // ======= restore form data after customer creation
    useEffect(() => {
      const draft = location?.state?.bookingDraft;
      const created = location?.state?.createdCustomer;

      if (draft) {
        setFormData(draft);
        setCustomerQuery(location?.state?.customerQuery || "");
      }

      if (created?.id) {
        // select the new customer
        setFormData((prev) => ({ ...prev, customerId: String(created.id) }));
        setCustomerQuery(created.name); // show name in input

        // ensure it's in the dropdown list so selectedCustomer works
        setCustomers((prev) => {
          const exists = prev.some((c) => c.id === created.id);
          return exists ? prev : [created, ...prev];
        });
      }

      // clear navigation state so refresh/click doesn't re-apply
      if (draft || created) {
        navigate(".", { replace: true });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ======= lazy customer search with debounce
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const q = customerQuery.trim();
    console.log("🔍 Customer query changed:", q);
    
    if (q.length === 0) {
      console.log("⚠️ Query empty, clearing results");
      setCustomers([]);
      setCustomerLoading(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    setCustomerLoading(true);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const url = `/api/users/customers?search=${encodeURIComponent(q)}`;
        console.log("📡 Fetching customers from:", url);
        const res = await apiFetch(url);
        console.log("📡 Customer API response status:", res.status);
        
        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          console.error("❌ Customer API error:", msg);
          throw new Error(msg?.message || "Failed to search customers");
        }
        const data = await res.json();
        console.log("✅ Customer data received:", data);
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("❌ Customer search error:", e);
        toast.error(e?.message || "Customer search failed");
        setCustomers([]);
      } finally {
        setCustomerLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [customerQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target as Node)) {
        setShowStaffDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======= submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.customerId ||
      !formData.date ||
      !formData.startTime ||
      !formData.serviceName ||
      formData.staffIds.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const endTimeToSend = formData.endTime || formData.startTime;

    try {
      const body = {
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: endTimeToSend,
        customer_id: Number(formData.customerId),
        service_name: formData.serviceName,
        service_amount: Number(formData.totalAmount || 0),
        note: formData.notes || null,
        staff_ids: formData.staffIds.map((s) => Number(s)),
      };

      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => null);
        setConflict(
          data?.message
            ? `${data.message} (booking #${data.conflict_booking_id ?? "?"})`
            : `Time conflict for ${body.booking_date} ${body.start_time}-${body.end_time}`
        );
        toast.error("Booking time conflict");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to create booking");
        return;
      }

      const data = await res.json();
      toast.success("Booking created");
      navigate(`/bookings/${data.booking_id}`);
    } catch {
      toast.error("Failed to create booking");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/bookings")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Booking</h1>
          <p className="text-gray-600 mt-1">Schedule a new maintenance booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      required
                    />
                  </div>

                  {/* ✅ MULTI STAFF PICKER - Custom Dropdown */}
                  <div className="space-y-2" ref={staffDropdownRef}>
                    <Label>
                      Staff Assigned <span className="text-red-600">*</span>
                    </Label>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={staffLoading ? "Loading..." : "Search staff..."}
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        onFocus={() => setShowStaffDropdown(true)}
                        disabled={staffLoading}
                      />

                      {showStaffDropdown && !staffLoading && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
                          {filteredStaff.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              No staff found
                            </div>
                          ) : (
                            filteredStaff.map((s) => {
                              const id = String(s.id);
                              const checked = formData.staffIds.includes(id);
                              return (
                                <div
                                  key={s.id}
                                  className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100"
                                  onClick={() => toggleStaff(id)}
                                >
                                  <div className="flex items-center justify-center w-4 h-4 border rounded">
                                    {checked && <span className="text-xs">✓</span>}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{s.name}</span>
                                    <span className="text-xs text-muted-foreground">{s.phone_no}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* selected staff chips */}
                    {selectedStaff.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedStaff.map((s) => (
                          <Badge key={s.id} variant="outline" className="flex items-center gap-2">
                            {s.name}
                            <button
                              type="button"
                              onClick={() => removeStaff(String(s.id))}
                              className="opacity-70 hover:opacity-100"
                              aria-label={`Remove ${s.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">
                      Start Time <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                    />
                  </div>
                </div>

                {conflict && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Scheduling Conflict</p>
                      <p className="text-sm text-red-700">{conflict}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Service Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Plumbing Repair"
                      value={formData.serviceName}
                      onChange={(e) => handleChange("serviceName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Amount (LKR) (Optional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) => handleChange("totalAmount", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Additional notes or special instructions"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2" ref={customerDropdownRef}>
                    <Label>
                      Select Customer <span className="text-red-600">*</span>
                    </Label>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Type to search customer..."
                        value={customerQuery}
                        onChange={(e) => {
                          setCustomerQuery(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                      />

                      {showCustomerDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
                          {customerQuery.trim().length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              Start typing to search customers...
                            </div>
                          ) : customerLoading ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">Searching...</div>
                          ) : customers.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              No customer found
                            </div>
                          ) : (
                            customers.map((c) => {
                              const isSelected = formData.customerId === String(c.id);
                              return (
                                <div
                                  key={c.id}
                                  className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    handleChange("customerId", String(c.id));
                                    setShowCustomerDropdown(false);
                                    setCustomerQuery(c.name);
                                  }}
                                >
                                  <div className="flex flex-col flex-1">
                                    <span className="font-medium text-sm">{c.name}</span>
                                    <span className="text-xs text-muted-foreground">{c.phone_no}</span>
                                  </div>
                                  {isSelected && <span className="text-sm">✓</span>}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCustomer && (
                    <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedCustomer.phone_no}</p>
                      </div>
                      {selectedCustomer.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedCustomer.email}</p>
                        </div>
                      )}
                      {selectedCustomer.loyalty_number && (
                        <div>
                          <p className="text-sm text-gray-600">Loyalty Number</p>
                          <Badge variant="outline">{selectedCustomer.loyalty_number}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                 <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate("/customers/new", {
                        state: {
                          returnTo: "/bookings/new",
                          bookingDraft: formData,
                          customerQuery,
                        },
                      })
                    }
                  >
                    + Add New Customer
                  </Button>

                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={!!conflict}>
                Save Booking
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/bookings")}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
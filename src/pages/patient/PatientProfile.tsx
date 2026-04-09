import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  QrCode,
  Save,
} from "lucide-react";
import { formatPhone, formatAbhaHpr } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PatientProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              {user?.name?.charAt(0) || "P"}
            </div>
            <h3 className="font-semibold text-lg">{user?.name || "Patient"}</h3>
            <p className="text-sm text-muted-foreground mt-1">Patient</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <Badge className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> ABHA Linked
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> Aadhaar Linked
              </Badge>
            </div>

            {/* QR Code placeholder */}
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <QrCode className="w-24 h-24 mx-auto text-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">ABHA QR Code</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => toast.success("QR code generated")}
              >
                Generate QR
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Full Name
                </label>
                <Input defaultValue={user?.name || "Rahul Sharma"} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input defaultValue="rahul.kumar@gmail.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  defaultValue="91234 56789"
                  onChange={(e) =>
                    (e.target.value = formatPhone(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  ABHA ID
                </label>
                <Input defaultValue="91-1234-5678-9012" disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Date of Birth
                </label>
                <Input type="date" defaultValue="1990-05-15" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Blood Group
                </label>
                <Input defaultValue="O+" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Profile updated")}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

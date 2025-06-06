"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, Users, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import { VipBadge } from "@/components/ui/vip-badge";

interface VipUser {
  id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  daysRemaining: number;
  isActive: boolean;
}

export default function AdminPage() {
  const [userIdToMakeVip, setUserIdToMakeVip] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "annual">("annual");
  const [durationDays, setDurationDays] = useState(365);
  const [vipUsers, setVipUsers] = useState<VipUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const showAlert = (message: string, type: "success" | "error" = "success") => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const makeUserVip = async () => {
    if (!userIdToMakeVip.trim()) {
      showAlert("Por favor ingresa un User ID válido", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/make-vip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userIdToMakeVip.trim(),
          plan: selectedPlan,
          durationDays,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert(data.message, "success");
        setUserIdToMakeVip("");
        loadVipUsers(); // Refresh the list
      } else {
        showAlert(data.error || "Error al hacer usuario VIP", "error");
      }
    } catch (error) {
      showAlert("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeUserVip = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/remove-vip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert(data.message, "success");
        loadVipUsers(); // Refresh the list
      } else {
        showAlert(data.error || "Error al remover VIP", "error");
      }
    } catch (error) {
      showAlert("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadVipUsers = async () => {
    try {
      const response = await fetch("/api/admin/list-vips");
      const data = await response.json();

      if (response.ok && data.success) {
        setVipUsers(data.vipUsers);
      } else {
        showAlert(data.error || "Error al cargar usuarios VIP", "error");
      }
    } catch (error) {
      showAlert("Error al cargar usuarios VIP", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
            <p className="text-slate-600">Gestiona usuarios VIP y suscripciones</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Make User VIP Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-slate-900">Hacer Usuario VIP</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User ID de Clerk
                </label>
                <Input
                  type="text"
                  placeholder="user_2r9QjHjGJ5rCjXoXSq4W8b7cG6Z"
                  value={userIdToMakeVip}
                  onChange={(e) => setUserIdToMakeVip(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duración (días)
                </label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 365)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={makeUserVip}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? "Processing..." : "Make VIP"}
              </Button>
            </div>
          </motion.div>

          {/* VIP Users List Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Usuarios VIP</h2>
              </div>
              <Button onClick={loadVipUsers} variant="outline" size="sm">
                Actualizar
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {vipUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  No hay usuarios VIP activos
                </p>
              ) : (
                vipUsers.map((user) => (
                  <motion.div
                    key={user.userId}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {user.userId.substring(0, 20)}...
                          </code>
                          <VipBadge size="sm" showDays daysRemaining={user.daysRemaining} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="capitalize">{user.plan}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {user.daysRemaining} días
                          </span>
                          <span className={`flex items-center gap-1 ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {user.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {user.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeUserVip(user.userId)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover VIP
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-bold text-blue-900 mb-2">Instrucciones:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Para hacer a Calin VIP, necesitas su User ID de Clerk (formato: user_xxxxx)</li>
            <li>• Puedes encontrar el User ID en los logs de la aplicación o en Clerk Dashboard</li>
            <li>• El plan y duración se pueden ajustar según necesidades</li>
            <li>• Los cambios se reflejan inmediatamente en la aplicación</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
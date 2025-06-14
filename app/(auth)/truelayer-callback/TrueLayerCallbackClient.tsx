"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface TrueLayerCallbackClientProps {
  code?: string;
  error?: string;
  error_description?: string;
}
export default function TrueLayerCallbackClient({
  code,
  error,
  error_description,
}: TrueLayerCallbackClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const errorDescription =
        error_description || "An unknown error occurred with TrueLayer.";
      console.error("TrueLayer Callback Error:", error, errorDescription);
      toast.error(`Connection failed: ${errorDescription}`);
      localStorage.removeItem("bankAccountNameInProgress");
      router.push("/accounts");
      return;
    }

    if (code) {
      const bankAccountName = localStorage.getItem("bankAccountNameInProgress");
      localStorage.removeItem("bankAccountNameInProgress");

      const toastId = toast.loading(
        "Connecting to your bank and fetching account details..."
      );

      axios
        .post("/api/truelayer/exchange-token", { code })
        .then((exchangeRes) => {
          toast.loading("Finalizing setup and syncing transactions...", {
            id: toastId,
          });
          return axios.post("/api/truelayer/sync", {
            access_token: exchangeRes.data.access_token,
            connection_id: exchangeRes.data.connection_id,
            force: true,
          });
        })
        .then(() => {
          toast.success("Bank connected and accounts synced successfully!", {
            id: toastId,
          });
          router.push("/accounts");
        })
        .catch((err) => {
          console.error("TrueLayer Process Error:", err);
          const errorMessage =
            err.response?.data?.details ||
            err.response?.data?.error ||
            err.message ||
            "An unexpected error occurred.";
          toast.error(`Connection failed: ${errorMessage}`, { id: toastId });
          router.push("/accounts");
        });
    }
  }, [code, error, error_description, router]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Connecting to your bank...</h2>
      <p>
        Please wait while we securely connect your account. You will be
        redirected shortly.
      </p>
    </div>
  );
}

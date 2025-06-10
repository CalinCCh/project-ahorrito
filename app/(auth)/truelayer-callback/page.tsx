"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import axios from "axios";
import { toast } from "sonner";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = "force-dynamic";

function TrueLayerCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      const errorDescription =
        searchParams.get("error_description") ||
        "An unknown error occurred with TrueLayer.";
      console.error("TrueLayer Callback Error:", error, errorDescription);
      toast.error(`Connection failed: ${errorDescription}`);
      localStorage.removeItem("bankAccountNameInProgress");
      router.push("/accounts");
      return;
    }

    if (code) {
      const toastId = toast.loading("Connecting to your bank...");

      // First step: Exchange token and redirect immediately
      axios
        .post("/api/truelayer/exchange-token", { code })
        .then((exchangeRes) => {
          // Store connection ID for later reference
          const connectionId = exchangeRes.data.connection_id;

          // Generate a unique timestamp to force the UI to treat this as a new account
          const timestamp = Date.now();
          localStorage.setItem("lastConnectedAccountId", connectionId);
          localStorage.setItem("lastConnectedTimestamp", timestamp.toString());
          console.log(
            "Stored connection ID:",
            connectionId,
            "with timestamp:",
            timestamp
          );

          // Show success message
          toast.success(
            "Bank connected successfully! Syncing transactions in background...",
            {
              id: toastId,
              duration: 5000,
            }
          );

          // Sync immediately to create the account and get its ID
          return axios
            .post("/api/truelayer/sync", {
              access_token: exchangeRes.data.access_token,
              connection_id: connectionId,
              force: true,
            })
            .then((syncRes) => {
              // If we have account data, save the first account ID
              if (syncRes.data.accounts && syncRes.data.accounts.length > 0) {
                // Store the actual account ID instead of connection ID
                const accountId = syncRes.data.accounts[0].account.id;
                localStorage.setItem("lastConnectedAccountId", accountId);
                console.log(
                  "Stored new account ID:",
                  accountId,
                  "with timestamp:",
                  timestamp
                );

                // Dispatch custom event with account ID and timestamp
                if (typeof window !== "undefined") {
                  const event = new CustomEvent("account-created", {
                    detail: {
                      accountId,
                      timestamp,
                      isNewConnection: true,
                    },
                  });
                  window.dispatchEvent(event);
                  console.log(
                    "Dispatched account-created event with ID:",
                    accountId
                  );
                }
              } else {
                console.warn("No accounts found in sync response");
                // Dispatch generic event
                if (typeof window !== "undefined") {
                  const event = new CustomEvent("account-created", {
                    detail: {
                      timestamp,
                      isNewConnection: true,
                    },
                  });
                  window.dispatchEvent(event);
                }
              }

              // Redirect to accounts page
              router.push(
                "/accounts?newAccount=true&autoRefresh=true&ts=" + timestamp
              );
            });
        })
        .catch((err) => {
          console.error("TrueLayer Process Error:", err);
          const errorMessage =
            err.response?.data?.details ||
            err.response?.data?.error ||
            err.message ||
            "An unexpected error occurred.";
          toast.error(`Connection failed: ${errorMessage}`, {
            id: toastId,
          });
          router.push("/accounts");
        });
    }
  }, [searchParams, router]);

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

export default function TrueLayerCallbackPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Loading...</h2>
          <p>Please wait while we process your request.</p>
        </div>
      }
    >
      <TrueLayerCallbackContent />
    </Suspense>
  );
}

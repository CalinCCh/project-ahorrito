"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";

export default function TrueLayerCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      axios
        .post("/api/truelayer/exchange-token", { code })
        .then((res) => {
          axios.post("/api/truelayer/sync", {
            access_token: res.data.access_token,
          });
          router.push("/");
        })
        .catch((err) => {
          alert(
            "La conexión expiró o ya fue usada. Por favor, vuelve a conectar tu banco."
          );
          router.push("/settings");
        });
    }
  }, [searchParams, router]);

  return <div>Conectando con tu banco...</div>;
}

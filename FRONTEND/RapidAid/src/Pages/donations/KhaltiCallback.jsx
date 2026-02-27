import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/Axios";

export default function KhaltiCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get("pidx");

      if (!pidx) {
        setStatus("failed");
        setMessage("Missing payment reference from Khalti.");
        return;
      }

      try {
        const res = await axiosInstance.post("/donations/khalti/verify/", { pidx });
        if (res?.data?.payment_status === "paid") {
          setStatus("success");
          setMessage("Payment verified. Thank you for your donation.");
          setTimeout(() => navigate("/donations"), 1500);
        } else if (res?.data?.payment_status === "pending") {
          setStatus("pending");
          setMessage("Payment is pending confirmation. Please check again shortly.");
        } else {
          setStatus("failed");
          setMessage("Payment verification failed.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage(error?.response?.data?.detail || "Could not verify payment.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="section-wrap min-h-screen pt-28">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#d4e2eb] bg-white p-8 text-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Khalti Payment</h1>
        <p className="mt-3 text-sm text-[var(--text-soft)]">{message}</p>
        {status !== "verifying" && (
          <button
            onClick={() => navigate("/donations")}
            className="mt-5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            Back to Donations
          </button>
        )}
      </div>
    </div>
  );
}

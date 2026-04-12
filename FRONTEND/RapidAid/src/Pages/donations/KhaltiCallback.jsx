import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function KhaltiCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifiedRef = useRef(false);
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (pidx && !verifiedRef.current) {
      verifiedRef.current = true;

      axiosInstance
        .post("/donations/verify-khalti/", { pidx })
        .then((res) => {
          if (res.data.success) {
            setStatus("success");
            setTimeout(() => navigate("/donations"), 4500);
          } else {
            setStatus("error");
            setErrorMsg(res.data.detail || "Transaction verification failed.");
          }
        })
        .catch((err) => {
          setStatus("error");
          setErrorMsg(err.response?.data?.detail || err.message || "An unknown error occurred.");
        })
        .finally(() => {
          const freshParams = new URLSearchParams(searchParams);
          freshParams.delete("pidx");
          freshParams.delete("transaction_id");
          freshParams.delete("tidx");
          freshParams.delete("amount");
          freshParams.delete("total_amount");
          freshParams.delete("mobile");
          freshParams.delete("status");
          freshParams.delete("purchase_order_id");
          freshParams.delete("purchase_order_name");
          setSearchParams(freshParams, { replace: true });
        });
    } else if (!pidx && !verifiedRef.current) {
      setStatus("error");
      setErrorMsg("Missing Khalti payment index (pidx) in request.");
    }
  }, [searchParams, navigate, setSearchParams]);

  return (
    <div className="section-wrap min-h-[85vh] flex items-center justify-center p-6 bg-gradient-to-b from-[#f3f8fc] to-white">
      <div className="w-full max-w-lg rounded-[32px] border border-[#e5eef4] bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#5C2D91] opacity-[0.03]" />
        
        {status === "verifying" && (
          <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#5C2D91]/10">
              <Loader2 className="h-10 w-10 animate-[spin_2s_linear_infinite] text-[#5C2D91]" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#5C2D91]/30 animate-[spin_4s_linear_infinite_reverse]" />
            </div>
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-[#1a1a1a]">Securely Verifying</h2>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              We're waiting on Khalti's server to confirm your transaction details. Please wait.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100/50 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
              <CheckCircle2 className="h-12 w-12 text-green-600 animate-[bounce_1s_ease-in-out_infinite]" style={{ animationIterationCount: 2 }} />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-green-700">Payment Secured!</h2>
            <p className="mb-6 max-w-xs text-base leading-relaxed text-gray-600">
              Your generous monetary contribution brings hope when it's needed most. Thank you.
            </p>
            <div className="flex w-full flex-col gap-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-green-500 animate-[pulse_4s_ease-in-out_infinite] w-full" />
              </div>
              <p className="text-xs font-semibold text-gray-400">Taking you back automatically...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100/50">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-red-700">Verification Failed</h2>
            <p className="mb-8 max-w-[280px] rounded-2xl bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-800 border border-red-100">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate("/donations")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg w-full"
            >
              Return Home
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

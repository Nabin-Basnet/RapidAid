import { useNavigate } from "react-router-dom";

export default function MakeDonation() {
  const navigate = useNavigate();

  return (
    <div className="section-wrap min-h-screen pt-28">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#d4e2eb] bg-white p-8 text-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Donation Workspace Updated</h1>
        <p className="mt-3 text-sm text-[var(--text-soft)]">
          This legacy page has been replaced by the new guided donation flow.
        </p>
        <button
          onClick={() => navigate("/donates")}
          className="mt-5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
        >
          Open New Donation Form
        </button>
      </div>
    </div>
  );
}

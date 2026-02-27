const DonorProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Donor Identity</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">Profile</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f7f4] text-[var(--brand)] font-bold">
          {(user?.full_name || "D").slice(0, 1)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#deebf3] bg-[#f8fcff] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Name</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text)]">{user?.full_name || "N/A"}</p>
        </div>
        <div className="rounded-2xl border border-[#deebf3] bg-[#f8fcff] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Email</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text)]">{user?.email || "N/A"}</p>
        </div>
      </div>
    </section>
  );
};

export default DonorProfile;

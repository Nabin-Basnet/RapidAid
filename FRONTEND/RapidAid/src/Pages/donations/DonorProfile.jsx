const DonorProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="bg-white/90 backdrop-blur border border-emerald-100 shadow-sm rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">
            Profile
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            Donor Details
          </h2>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          {user?.full_name?.slice(0, 1) || "D"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4">
          <p className="text-xs text-emerald-700 uppercase tracking-[0.2em]">
            Name
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {user?.full_name || "N/A"}
          </p>
        </div>
        <div className="bg-sky-50 rounded-2xl p-4">
          <p className="text-xs text-sky-700 uppercase tracking-[0.2em]">
            Email
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {user?.email || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;

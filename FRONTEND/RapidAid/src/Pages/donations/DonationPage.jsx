import { useEffect, useState } from "react";
import axios from "../../api/Axios";
import BecomeDonorForm from "./DonorForm";
import DonorProfile from "./DonorProfile";
import DonationHistory from "./DonorDetails";

const DonationPage = () => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/donations/donors/")
      .then((res) => {
        // assuming API returns donor of logged-in user
        setDonor(res.data[0]);
      })
      .catch(() => setDonor(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {donor ? (
        <>
          <DonorProfile donor={donor} />
          <DonationHistory />
        </>
      ) : (
        <BecomeDonorForm onSuccess={setDonor} />
      )}
    </div>
  );
};

export default DonationPage;

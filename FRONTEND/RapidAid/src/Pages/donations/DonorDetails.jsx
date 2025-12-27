import { useEffect, useState } from "react";
import axios from "../../api/Axios";

const DonorDetails = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    axios
      .get("/donations/donations/")
      .then((res) => setDonations(res.data));
  }, []);

  return (
    <div className="bg-white p-4 shadow rounded mt-6">
      <h2 className="text-xl font-semibold mb-4">My Donations</h2>

      {donations.length === 0 ? (
        <p>No donations yet.</p>
      ) : (
        donations.map((d) => (
          <div key={d.id} className="border p-3 mb-2 rounded">
            <p><strong>Type:</strong> {d.donation_type}</p>

            {d.amount && <p><strong>Amount:</strong> Rs. {d.amount}</p>}
            {d.item_description && (
              <p><strong>Item:</strong> {d.item_description} ({d.quantity})</p>
            )}

            <p className="text-sm text-gray-500">{d.created_at}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default DonorDetails;

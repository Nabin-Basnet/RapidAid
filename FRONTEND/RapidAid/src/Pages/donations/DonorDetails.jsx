import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/Axios";

const DonorDetails = () => {
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/donations/donations/")
      .then((res) => setDonations(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white p-4 shadow rounded mt-6">
      {/* Header with Donate Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Donations</h2>

        <button
          onClick={() => navigate("/donates")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Donate Now
        </button>
      </div>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        donations.map((d) => (
          <div key={d.id} className="border p-3 mb-2 rounded">
            <p>
              <strong>Type:</strong> {d.donation_type}
            </p>

            {d.amount && (
              <p>
                <strong>Amount:</strong> Rs. {d.amount}
              </p>
            )}

            {d.item_description && (
              <p>
                <strong>Item:</strong> {d.item_description} ({d.quantity})
              </p>
            )}

            <p className="text-sm text-gray-500">
              {new Date(d.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default DonorDetails;

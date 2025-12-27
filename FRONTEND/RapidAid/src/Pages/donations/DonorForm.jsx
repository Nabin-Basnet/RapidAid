import { useState } from "react";
import axios from "../../api/Axios";

const DonorForm = ({ onSuccess }) => {
  const [donorType, setDonorType] = useState("individual");

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/donations/donors/", {
        donor_type: donorType,
      });
      onSuccess(res.data);
    } catch {
      alert("Failed to register as donor");
    }
  };

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Become a Donor</h2>

      <form onSubmit={submitHandler}>
        <select
          value={donorType}
          onChange={(e) => setDonorType(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="individual">Individual</option>
          <option value="organization">Organization</option>
        </select>

        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Create Donor ID
        </button>
      </form>
    </div>
  );
};

export default DonorForm;

import { useState } from "react";
import axios from "../../api/Axios";

const MakeDonation = () => {
  const [type, setType] = useState("money");
  const [formData, setFormData] = useState({});

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/donations/donations/", {
        donation_type: type,
        ...formData,
      });
      alert("Donation successful");
    } catch {
      alert("Donation failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Make a Donation</h2>

      <form onSubmit={submitHandler}>
        <select
          onChange={(e) => setType(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="money">Money</option>
          <option value="item">Item</option>
        </select>

        {type === "money" ? (
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 w-full mb-4"
            onChange={(e) => setFormData({ amount: e.target.value })}
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Item Description"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setFormData({ ...formData, item_description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border p-2 w-full mb-4"
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </>
        )}

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Donate
        </button>
      </form>
    </div>
  );
};

export default MakeDonation;

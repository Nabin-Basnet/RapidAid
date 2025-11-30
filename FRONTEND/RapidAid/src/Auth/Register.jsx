import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/Axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "citizen", // default role
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post("auth/register/", formData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // Show detailed backend error if available
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-xl shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        {success && <p className="text-green-600 text-center mb-2">{success}</p>}

        <label className="block mb-2">Full Name</label>
        <input
          type="text"
          name="full_name"
          className="w-full p-2 border rounded mb-3"
          onChange={handleChange}
          required
        />

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          className="w-full p-2 border rounded mb-3"
          onChange={handleChange}
          required
        />

        <label className="block mb-2">Phone</label>
        <input
          type="text"
          name="phone"
          className="w-full p-2 border rounded mb-3"
          onChange={handleChange}
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          name="password"
          className="w-full p-2 border rounded mb-3"
          onChange={handleChange}
          required
        />

        {/* Optional: role selection */}
        {/* <label className="block mb-2">Role</label>
        <select
          name="role"
          className="w-full p-2 border rounded mb-3"
          onChange={handleChange}
        >
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
          <option value="rescue_team">Rescue Team</option>
          <option value="assessment_team">Assessment Team</option>
          <option value="donor">Donor</option>
        </select> */}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md"
        >
          Register
        </button>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;

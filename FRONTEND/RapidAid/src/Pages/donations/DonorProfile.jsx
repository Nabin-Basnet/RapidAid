const DonorProfile = ({ donor }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <h2 className="text-xl font-semibold mb-2">Donor Details</h2>

      <p><strong>Donor ID:</strong> {donor.id}</p>
      <p><strong>Phone:</strong> {donor.phone}</p>
      <p><strong>Address:</strong> {donor.address}</p>
      <p><strong>Registered:</strong> {donor.created_at}</p>
    </div>
  );
};

export default DonorProfile;

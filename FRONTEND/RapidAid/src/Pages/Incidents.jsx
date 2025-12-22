import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Incidents = () => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]); // always array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/incidents/"
        );

        /**
         * DRF PAGINATION FIX
         * - If paginated → res.data.results
         * - If not → res.data
         */
        if (Array.isArray(res.data)) {
          setIncidents(res.data);
        } else if (Array.isArray(res.data.results)) {
          setIncidents(res.data.results);
        } else {
          setIncidents([]);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load incidents");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Reported Incidents
        </h1>

        {incidents.length === 0 ? (
          <p className="text-gray-600">
            No incidents found.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold">
                  {incident.title}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Type: {incident.incident_type}
                </p>

                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="font-medium capitalize">
                    {incident.status}
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Reported on {incident.created_at}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;

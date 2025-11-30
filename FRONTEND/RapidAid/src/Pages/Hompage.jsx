import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, AlarmClock } from "lucide-react";

export default function Home() {
  return (
    <div className="pt-20 w-full">
      {/* Hero Section */}
      <section className="bg-blue-50 w-full py-24 px-6 md:px-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-700 mb-6">
          RapidAid – Fast & Reliable Disaster Response
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Report emergencies, track rescue operations, donate resources, and help communities recover faster.
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <Link
            to="/report"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 flex items-center gap-2 transition"
          >
            Report Incident <ArrowRight size={18} />
          </Link>

          <Link
            to="/incidents"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-100 transition"
          >
            View Incidents
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-10">
        <div className="bg-white shadow-md p-8 rounded-2xl text-center">
          <AlarmClock className="mx-auto text-blue-600" size={48} />
          <h3 className="text-2xl font-semibold mt-4">Real-Time Reporting</h3>
          <p className="text-gray-600 mt-2">
            Submit incidents instantly and notify authorities without delay.
          </p>
        </div>

        <div className="bg-white shadow-md p-8 rounded-2xl text-center">
          <Shield className="mx-auto text-green-600" size={48} />
          <h3 className="text-2xl font-semibold mt-4">Rescue Coordination</h3>
          <p className="text-gray-600 mt-2">
            Rescue teams receive assignments and update progress in real-time.
          </p>
        </div>

        <div className="bg-white shadow-md p-8 rounded-2xl text-center">
          <Heart className="mx-auto text-red-600" size={48} />
          <h3 className="text-2xl font-semibold mt-4">Transparent Donations</h3>
          <p className="text-gray-600 mt-2">
            Donate items or funds and track how your contribution is used.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-blue-600 py-16 text-center text-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Join Hands to Save Lives
        </h2>
        <p className="text-lg mt-3 max-w-2xl mx-auto">
          Every second counts. Your report, your donation, or your action can make a huge difference.
        </p>

        <Link
          to="/donate"
          className="inline-block mt-6 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition"
        >
          Donate Now
        </Link>
      </section>
    </div>
  );
}

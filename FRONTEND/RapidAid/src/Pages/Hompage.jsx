import { Link } from "react-router-dom";
import { ArrowRight, Siren, Shield, HandHeart, Layers3 } from "lucide-react";

const features = [
  {
    title: "Incident Intelligence",
    description: "Capture emergency signals with context, media evidence, and timeline-ready metadata.",
    icon: Siren,
    tone: "from-[#fef2f2] to-[#fff8f6]",
  },
  {
    title: "Coordinated Response",
    description: "Route verified incidents to response teams and keep communities updated with clear status transitions.",
    icon: Shield,
    tone: "from-[#ecfdf8] to-[#f6fffb]",
  },
  {
    title: "Transparent Support",
    description: "Track donations and public contribution records with accountable, event-level visibility.",
    icon: HandHeart,
    tone: "from-[#fff8eb] to-[#fffdf6]",
  },
];

export default function Home() {
  return (
    <div className="pb-10">
      <section className="section-wrap pt-28">
        <div className="glass-card relative overflow-hidden rounded-[28px] px-6 py-12 md:px-12">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#c8fff1]/70 blur-2xl" />
          <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-[#ffe0d2]/70 blur-2xl" />

          <div className="relative z-10 max-w-3xl fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#b7e9df] bg-[#ebfffa] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              <Layers3 size={14} />
              RapidAid Command UI
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-[var(--text)] md:text-6xl">
              Crisis Response, Designed for Speed and Trust
            </h1>
            <p className="mt-5 max-w-2xl text-base text-[var(--text-soft)] md:text-lg">
              Report incidents, verify events, coordinate rescue operations, and maintain transparent
              donation workflows in one integrated platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
              >
                Report Incident
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/incidents"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#cddae4] bg-white px-6 py-3 text-sm font-bold text-[var(--text)] transition hover:border-[var(--brand)]"
              >
                Explore Incidents
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap mt-10 grid gap-5 md:grid-cols-3">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`fade-in-up rounded-3xl border border-[#d8e5ee] bg-gradient-to-br ${feature.tone} p-6`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="mb-4 inline-flex rounded-xl bg-white p-2 text-[var(--brand)]">
              <feature.icon size={20} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text)]">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="section-wrap mt-10">
        <div className="rounded-[28px] border border-[#c8dce7] bg-[#0d2338] px-8 py-10 text-white md:px-12">
          <h2 className="text-3xl font-bold md:text-4xl">Every action leaves a meaningful trace.</h2>
          <p className="mt-3 max-w-2xl text-sm text-[#c9d7e4] md:text-base">
            RapidAid is built to support urgent execution and long-term public accountability.
            Join the network as a reporter, responder, volunteer, or donor.
          </p>
          <Link
            to="/donations"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea5d2b]"
          >
            Support Verified Incidents
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

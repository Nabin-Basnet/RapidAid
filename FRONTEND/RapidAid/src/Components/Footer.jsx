export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/50 bg-white/60 py-8 backdrop-blur-md">
      <div className="section-wrap flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-[var(--text-soft)]">
          &copy; {year} RapidAid. Built for high-trust emergency response.
        </p>
        <div className="flex gap-6 text-sm text-[var(--text-soft)]">
          <a className="transition hover:text-[var(--brand)]" href="/privacy">Privacy</a>
          <a className="transition hover:text-[var(--brand)]" href="/terms">Terms</a>
          <a className="transition hover:text-[var(--brand)]" href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}

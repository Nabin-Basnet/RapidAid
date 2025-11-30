export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-100 text-gray-700 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

        <p className="text-sm">
          © {year} RapidAid. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>

      </div>
    </footer>
  );
}

export default function GovFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#1a3a6b', borderTop: '3px solid #f7941d' }}>
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-center md:text-left">
            <p className="text-white text-xs font-semibold" style={{ letterSpacing: '0.3px' }}>
              © {year} Ministry of Health &amp; Family Welfare, Government of India
            </p>
            <p className="text-blue-300 text-xs mt-0.5">
              National Informatics Centre (NIC) | National Health Authority (NHA)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-300">
            <span className="hover:text-orange-300 cursor-pointer">Website Policy</span>
            <span>|</span>
            <span className="hover:text-orange-300 cursor-pointer">Accessibility</span>
            <span>|</span>
            <span className="hover:text-orange-300 cursor-pointer">Contact Us</span>
            <span>|</span>
            <span className="hover:text-orange-300 cursor-pointer">Help</span>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-3 pt-2 text-center">
          <p className="text-blue-400 text-xs">
            Best viewed in Chrome 100+ | Screen resolution 1366×768 or above | Federated Learning System v2.1
          </p>
        </div>
      </div>
    </footer>
  );
}

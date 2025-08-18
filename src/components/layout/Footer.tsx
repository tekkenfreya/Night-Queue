export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-black via-gray-950 to-gray-900/50 mt-auto border-t border-gray-800/30">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-light">© 2025</span>
            <span className="text-netflix-red font-heading font-black text-lg tracking-wide">NextPick</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="text-gray-500 text-sm">Find the gems. Skip the rest.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
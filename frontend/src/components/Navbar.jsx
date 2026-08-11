function Navbar() {
  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold">
          Competitive Programming Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          A
        </div>
      </div>
    </header>
  );
}

export default Navbar;
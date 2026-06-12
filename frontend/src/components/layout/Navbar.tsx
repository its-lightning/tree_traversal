export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border border-zinc-600 rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rotate-[-45deg]" />
          </div>
          <span className="text-white font-bold tracking-tight text-sm uppercase">
            Tree Traversal Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-xs font-mono">BST · 6 algorithms · step-by-step</span>
        </div>
      </div>
    </header>
  )
}

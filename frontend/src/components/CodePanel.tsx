import { useEffect, useRef } from "react"

interface CodePanelProps {
  source: string[]
  activeLine: number | null  // 1-based
  traversalName: string | null
}

export default function CodePanel({ source, activeLine, traversalName }: CodePanelProps) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [activeLine])

  if (source.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Source code</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-700 text-sm">Select a traversal to see its source code</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0">
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Source code</p>
        {traversalName && (
          <p className="text-white text-xs font-mono mt-0.5 font-medium uppercase tracking-wider">
            {traversalName}
          </p>
        )}
      </div>

      {/* Code lines */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {source.map((line, idx) => {
            const lineNum = idx + 1
            const isActive = lineNum === activeLine
            return (
              <div
                key={idx}
                ref={isActive ? activeRef : undefined}
                className={`flex text-xs font-mono transition-colors
                  ${isActive
                    ? "bg-zinc-800 border-l-2 border-l-white"
                    : "border-l-2 border-l-transparent hover:bg-zinc-950"
                  }`}
              >
                {/* Line number */}
                <span
                  className={`select-none w-9 flex-shrink-0 text-right pr-3 py-0.5 leading-5
                    ${isActive ? "text-zinc-400" : "text-zinc-700"}`}
                >
                  {lineNum}
                </span>
                {/* Code text */}
                <span
                  className={`py-0.5 leading-5 pr-4 whitespace-pre
                    ${isActive ? "text-white" : "text-zinc-400"}`}
                >
                  {line || " "}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

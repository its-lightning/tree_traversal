import { useRef, useEffect } from "react"
import type { Step } from "@/types"

interface StepLogProps {
  currentStep: Step | null
  traversalName: string | null
  traversalType: "recursive" | "morris" | null
}

const STEP_TYPE_LABELS: Record<string, string> = {
  visit:         "VISIT",
  go_left:       "GO LEFT",
  go_right:      "GO RIGHT",
  return:        "RETURN",
  thread_create: "THREAD CREATE",
  thread_remove: "THREAD REMOVE",
  move_left:     "MOVE LEFT",
  move_right:    "MOVE RIGHT",
}

const STEP_TYPE_COLORS: Record<string, string> = {
  visit:         "text-white bg-white/10 border-white/20",
  go_left:       "text-zinc-300 bg-zinc-800/50 border-zinc-700",
  go_right:      "text-zinc-300 bg-zinc-800/50 border-zinc-700",
  return:        "text-zinc-400 bg-zinc-900 border-zinc-700",
  thread_create: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  thread_remove: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  move_left:     "text-zinc-300 bg-zinc-800/50 border-zinc-700",
  move_right:    "text-zinc-300 bg-zinc-800/50 border-zinc-700",
}

// ── Call stack frame component ───────────────────────────────────────────────
function CallStackFrame({
  val,
  depth,
  isTop,
}: {
  val: number
  depth: number
  isTop: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all
        ${isTop
          ? "bg-white/10 border-white/25 text-white"
          : "bg-zinc-900 border-zinc-700 text-zinc-400"
        }`}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <span className="text-zinc-600 text-[10px] w-4 flex-shrink-0">{depth + 1}</span>
      <span>_recurse({val})</span>
      {isTop && (
        <span className="ml-auto text-[10px] text-zinc-500 bg-zinc-800 px-1 rounded">
          active
        </span>
      )}
    </div>
  )
}

export default function StepLog({ currentStep, traversalName, traversalType }: StepLogProps) {
  const visitedSoFar  = currentStep?.visitedSoFar ?? []
  const newestVal     = visitedSoFar[visitedSoFar.length - 1]
  const callStack     = currentStep?.callStack ?? []
  const isRecursive   = traversalType === "recursive"
  const stackEndRef   = useRef<HTMLDivElement>(null)

  // Scroll to bottom of call stack when it changes
  useEffect(() => {
    stackEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [callStack.length])

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Current step description */}
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Current step</p>
        <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3 min-h-[72px] flex flex-col justify-center gap-2">
          {currentStep ? (
            <>
              <span
                className={`self-start text-xs px-2 py-0.5 rounded-sm border font-mono font-medium
                  ${STEP_TYPE_COLORS[currentStep.type] ?? "text-zinc-400 border-zinc-700"}`}
              >
                {STEP_TYPE_LABELS[currentStep.type] ?? currentStep.type.toUpperCase()}
              </span>
              <p className="text-white text-sm leading-snug">{currentStep.description}</p>
            </>
          ) : (
            <p className="text-zinc-600 text-sm">
              {traversalName
                ? `${traversalName} loaded — press Next step to begin`
                : "Select a traversal to begin"}
            </p>
          )}
        </div>
      </div>

      {/* Call stack — only for recursive traversals */}
      {isRecursive && (
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            Call stack
            {callStack.length > 0 && (
              <span className="ml-2 text-zinc-600 normal-case tracking-normal">
                (depth {callStack.length})
              </span>
            )}
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
            {callStack.length === 0 ? (
              <p className="text-zinc-700 text-xs p-3">Stack empty</p>
            ) : (
              <div className="p-2 flex flex-col gap-1 max-h-52 overflow-y-auto">
                {/* Bottom of stack first, top last = most recently called */}
                {callStack.map((val, idx) => (
                  <CallStackFrame
                    key={idx}
                    val={val}
                    depth={idx}
                    isTop={idx === callStack.length - 1}
                  />
                ))}
                <div ref={stackEndRef} />
              </div>
            )}
            {/* Stack depth indicator bar */}
            <div className="border-t border-zinc-800 px-3 py-1.5 flex items-center gap-2">
              <span className="text-zinc-600 text-[10px] font-mono">stack depth</span>
              <div className="flex-1 bg-zinc-900 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min((callStack.length / 15) * 100, 100)}%` }}
                />
              </div>
              <span className="text-zinc-500 text-[10px] font-mono">{callStack.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Visited order */}
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Visited order</p>
        <div className="min-h-[48px] flex flex-wrap gap-1.5 items-start content-start">
          {visitedSoFar.length === 0 ? (
            <p className="text-zinc-700 text-xs">No nodes visited yet</p>
          ) : (
            visitedSoFar.map((val, idx) => {
              const isNewest = val === newestVal && idx === visitedSoFar.length - 1
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center justify-center text-xs font-mono rounded-sm px-2 py-0.5 border transition-all
                    ${isNewest
                      ? "bg-white text-black border-white font-bold"
                      : "bg-transparent text-zinc-400 border-zinc-700"
                    }`}
                >
                  {val}
                </span>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

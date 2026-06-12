import type { TraversalResult } from "@/types"
import { treeApi } from "@/lib/api"
import { useState } from "react"

interface TraversalControlsProps {
  traversal: TraversalResult | null
  stepIndex: number
  onTraversalLoad: (result: TraversalResult) => void
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  treeIsEmpty: boolean
}

const STANDARD_TRAVERSALS = [
  { key: "inorder",   label: "Inorder" },
  { key: "preorder",  label: "Preorder" },
  { key: "postorder", label: "Postorder" },
]

const MORRIS_TRAVERSALS = [
  { key: "morris_inorder",   label: "Morris Inorder" },
  { key: "morris_preorder",  label: "Morris Preorder" },
  { key: "morris_postorder", label: "Morris Postorder" },
]

export default function TraversalControls({
  traversal,
  stepIndex,
  onTraversalLoad,
  onNext,
  onPrev,
  onReset,
  treeIsEmpty,
}: TraversalControlsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const totalSteps = traversal?.steps.length ?? 0
  const isComplete = traversal !== null && stepIndex === totalSteps - 1 && totalSteps > 0
  const atStart = stepIndex <= -1

  async function handleTraversalClick(key: string) {
    if (treeIsEmpty) {
      setError("Add nodes to the tree first")
      return
    }
    setLoading(true)
    setError(null)
    setActiveKey(key)
    try {
      const result = await treeApi.traversal(key)
      onTraversalLoad(result)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function TraversalButton({ k, label }: { k: string; label: string }) {
    const isActive = activeKey === k && traversal !== null
    return (
      <button
        id={`traversal-btn-${k}`}
        onClick={() => handleTraversalClick(k)}
        disabled={loading}
        className={`text-xs h-8 px-2 rounded-sm border transition-colors font-mono flex-1 min-w-0
          ${isActive
            ? "bg-white text-black border-white"
            : "border-zinc-700 text-zinc-300 bg-transparent hover:bg-zinc-900 hover:text-white"
          }
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {/* Section label */}
      <p className="text-zinc-500 text-xs uppercase tracking-widest">Traversals</p>

      {/* Standard row */}
      <div className="space-y-1">
        <p className="text-zinc-600 text-xs">Standard (recursive)</p>
        <div className="flex gap-1">
          {STANDARD_TRAVERSALS.map(t => (
            <TraversalButton key={t.key} k={t.key} label={t.label} />
          ))}
        </div>
      </div>

      {/* Morris row */}
      <div className="space-y-1">
        <p className="text-zinc-600 text-xs">Morris (O(1) space)</p>
        <div className="flex gap-1">
          {MORRIS_TRAVERSALS.map(t => (
            <TraversalButton key={t.key} k={t.key} label={t.label} />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-sm px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Playback controls — only when traversal loaded */}
      {traversal && (
        <div className="pt-2 border-t border-zinc-800 space-y-3">
          {/* Step counter + complete badge */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs font-mono">
              {stepIndex < 0
                ? `0 / ${totalSteps} steps`
                : `Step ${stepIndex + 1} / ${totalSteps}`}
            </span>
            {isComplete && (
              <span
                id="complete-badge"
                className="bg-zinc-100 text-zinc-900 text-xs rounded-sm font-medium px-2 py-0.5"
              >
                ✓ Complete
              </span>
            )}
          </div>

          {/* Prev / Next / Reset */}
          <div className="flex gap-2">
            <button
              id="prev-step-btn"
              onClick={onPrev}
              disabled={atStart}
              className="border border-zinc-700 text-white bg-transparent hover:bg-zinc-900 rounded-sm
                         text-sm h-9 px-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              id="next-step-btn"
              onClick={onNext}
              disabled={isComplete}
              className="bg-white text-black hover:bg-zinc-100 rounded-sm font-medium
                         text-sm h-9 px-4 flex-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next step →
            </button>
            <button
              id="reset-traversal-btn"
              onClick={onReset}
              className="border border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-900 hover:text-white
                         rounded-sm text-sm h-9 px-3 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

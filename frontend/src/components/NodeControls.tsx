import { useState, useRef } from "react"
import type { TreeNode } from "@/types"
import { treeApi } from "@/lib/api"

interface NodeControlsProps {
  onTreeChange: (tree: TreeNode | null) => void
  selectedNodeVal: number | null
  onClearSelection: () => void
  onClearTraversal: () => void
  disabled: boolean
}

export default function NodeControls({
  onTreeChange,
  selectedNodeVal,
  onClearSelection,
  onClearTraversal,
  disabled,
}: NodeControlsProps) {
  const [inputVal, setInputVal] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function clearError() {
    setError(null)
  }

  async function handleAdd() {
    const val = parseInt(inputVal, 10)
    if (isNaN(val)) {
      setError("Enter a valid integer")
      return
    }
    setLoading(true)
    clearError()
    try {
      const res = await treeApi.add(val)
      onTreeChange(res.tree)
      onClearTraversal()
      setInputVal("")
      inputRef.current?.focus()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (selectedNodeVal === null) return
    setLoading(true)
    clearError()
    try {
      const res = await treeApi.delete(selectedNodeVal)
      onTreeChange(res.tree)
      onClearSelection()
      onClearTraversal()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExample() {
    setLoading(true)
    clearError()
    try {
      const res = await treeApi.example()
      onTreeChange(res.tree)
      onClearTraversal()
      onClearSelection()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setLoading(true)
    clearError()
    try {
      await treeApi.reset()
      onTreeChange(null)
      onClearTraversal()
      onClearSelection()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border-b border-zinc-800 space-y-3">
      {/* Add node row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="node-value-input"
          type="number"
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); clearError() }}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Node value…"
          disabled={loading || disabled}
          className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600
                     focus:outline-none focus:ring-1 focus:ring-zinc-500 rounded-sm h-9 px-3 text-sm font-mono
                     disabled:opacity-50"
        />
        <button
          id="add-node-btn"
          onClick={handleAdd}
          disabled={loading || disabled || inputVal === ""}
          className="bg-white text-black hover:bg-zinc-100 rounded-sm font-medium text-sm h-9 px-4
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Add node
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          id="delete-node-btn"
          onClick={handleDelete}
          disabled={loading || disabled || selectedNodeVal === null}
          className="border border-zinc-700 text-white bg-transparent hover:bg-zinc-900 rounded-sm text-sm h-9 px-3
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Delete {selectedNodeVal !== null ? `(${selectedNodeVal})` : "selected"}
        </button>
        <button
          id="load-example-btn"
          onClick={handleExample}
          disabled={loading || disabled}
          className="border border-zinc-700 text-white bg-transparent hover:bg-zinc-900 rounded-sm text-sm h-9 px-3
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Load example
        </button>
        <button
          id="reset-tree-btn"
          onClick={handleReset}
          disabled={loading || disabled}
          className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20
                     rounded-sm text-sm h-9 px-3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
        >
          Reset tree
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-sm px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}

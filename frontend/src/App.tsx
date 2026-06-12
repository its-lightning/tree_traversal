import { useState, useEffect, useRef, useCallback, type RefObject } from "react"
import type { TreeNode, TraversalResult, Step } from "@/types"
import { treeApi } from "@/lib/api"
import Navbar from "@/components/layout/Navbar"
import TreeCanvas from "@/components/TreeCanvas"
import NodeControls from "@/components/NodeControls"
import TraversalControls from "@/components/TraversalControls"
import StepLog from "@/components/StepLog"
import CodePanel from "@/components/CodePanel"

// ── Resizer hook ──────────────────────────────────────────────────────────────
function useResizer(
  initialLeft: number,
  initialRight: number,
  containerRef: RefObject<HTMLDivElement>
) {
  const [leftPct, setLeftPct] = useState(initialLeft)
  const [rightPct, setRightPct] = useState(initialRight)
  const dragging = useRef<"left" | "right" | null>(null)

  const onMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = "left"
  }, [])

  const onMouseDownRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = "right"
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const total = rect.width
      const pct = (x / total) * 100

      if (dragging.current === "left") {
        const newLeft = Math.max(25, Math.min(pct, 100 - rightPct - 15))
        setLeftPct(newLeft)
      } else {
        const newRight = Math.max(15, Math.min(100 - pct, 100 - leftPct - 15))
        setRightPct(newRight)
      }
    }
    function onMouseUp() {
      dragging.current = null
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [leftPct, rightPct, containerRef])

  const midPct = 100 - leftPct - rightPct

  return { leftPct, midPct, rightPct, onMouseDownLeft, onMouseDownRight }
}

export default function App() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [tree,      setTree]      = useState<TreeNode | null>(null)
  const [traversal, setTraversal] = useState<TraversalResult | null>(null)
  const [stepIndex, setStepIndex] = useState<number>(-1)
  const [selected,  setSelected]  = useState<number | null>(null)

  // ── Resizable layout ────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null!)
  const { leftPct, midPct, rightPct, onMouseDownLeft, onMouseDownRight } =
    useResizer(52, 24, containerRef)

  // ── Derived values — computed at render time, never stored ──────────────────
  const currentStep:    Step | null   = traversal && stepIndex >= 0 ? traversal.steps[stepIndex] : null
  const activeNodeVal:  number | null = currentStep?.node ?? null
  const visitedSoFar:   number[]      = currentStep?.visitedSoFar ?? []
  const activeCodeLine: number | null = currentStep?.codeLine ?? null

  // ── Load tree on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    treeApi.get().then(res => setTree(res.tree)).catch(() => {})
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleTreeChange(newTree: TreeNode | null) {
    setTree(newTree)
    clearTraversal()
  }

  function clearTraversal() {
    setTraversal(null)
    setStepIndex(-1)
  }

  function handleTraversalLoad(result: TraversalResult) {
    setTraversal(result)
    setStepIndex(-1)
  }

  function handleNext() {
    if (!traversal) return
    setStepIndex(i => Math.min(i + 1, traversal.steps.length - 1))
  }

  function handlePrev() {
    setStepIndex(i => Math.max(i - 1, -1))
  }

  function handleResetTraversal() {
    setStepIndex(-1)
  }

  function handleSelectNode(val: number) {
    setSelected(prev => prev === val ? null : val)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      {/* Three-column resizable layout */}
      <div
        ref={containerRef}
        className="flex-1 flex"
        style={{ height: "calc(100vh - 3.5rem)", overflow: "hidden" }}
      >
        {/* ── LEFT: Canvas column ─────────────────────────────────────────── */}
        <div
          className="flex flex-col border-r border-zinc-800 min-w-0"
          style={{ width: `${leftPct}%` }}
        >
          <NodeControls
            onTreeChange={handleTreeChange}
            selectedNodeVal={selected}
            onClearSelection={() => setSelected(null)}
            onClearTraversal={clearTraversal}
            disabled={false}
          />
          <div className="flex-1 p-4 min-h-0 overflow-hidden">
            <TreeCanvas
              tree={tree}
              activeNodeVal={activeNodeVal}
              visitedSoFar={visitedSoFar}
              selectedNodeVal={selected}
              onSelectNode={handleSelectNode}
              currentStep={currentStep}
              allStepsSoFar={traversal ? traversal.steps.slice(0, stepIndex + 1) : []}
            />
          </div>
        </div>

        {/* ── DRAG HANDLE left ───────────────────────────────────────────── */}
        <div
          onMouseDown={onMouseDownLeft}
          className="w-1 flex-shrink-0 bg-zinc-800 hover:bg-zinc-500 cursor-col-resize transition-colors group relative"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* ── CENTRE: Step log + traversal controls ──────────────────────── */}
        <div
          className="flex flex-col border-r border-zinc-800 min-w-0 overflow-hidden"
          style={{ width: `${midPct}%` }}
        >
          <div className="flex-1 overflow-y-auto">
            <StepLog
              currentStep={currentStep}
              traversalName={traversal?.name ?? null}
              traversalType={traversal?.name?.toLowerCase().startsWith("morris") ? "morris" : (traversal ? "recursive" : null)}
            />
          </div>
          <div className="border-t border-zinc-800 flex-shrink-0">
            <TraversalControls
              traversal={traversal}
              stepIndex={stepIndex}
              onTraversalLoad={handleTraversalLoad}
              onNext={handleNext}
              onPrev={handlePrev}
              onReset={handleResetTraversal}
              treeIsEmpty={tree === null}
            />
          </div>
        </div>

        {/* ── DRAG HANDLE right ──────────────────────────────────────────── */}
        <div
          onMouseDown={onMouseDownRight}
          className="w-1 flex-shrink-0 bg-zinc-800 hover:bg-zinc-500 cursor-col-resize transition-colors relative"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* ── RIGHT: Source code panel ───────────────────────────────────── */}
        <div
          className="flex flex-col min-h-0 overflow-hidden"
          style={{ width: `${rightPct}%` }}
        >
          <CodePanel
            source={traversal?.source ?? []}
            activeLine={activeCodeLine}
            traversalName={traversal?.name ?? null}
          />
        </div>
      </div>
    </div>
  )
}

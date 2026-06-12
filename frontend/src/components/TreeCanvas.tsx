import { useRef, useState, useEffect, useCallback } from "react"
import type { TreeNode, Step } from "@/types"

interface TreeCanvasProps {
  tree: TreeNode | null
  activeNodeVal: number | null
  visitedSoFar: number[]
  selectedNodeVal: number | null
  onSelectNode: (val: number) => void
  currentStep: Step | null
  allStepsSoFar: Step[]
}

function collectNodes(node: TreeNode | null, acc: TreeNode[] = []): TreeNode[] {
  if (!node) return acc
  acc.push(node)
  collectNodes(node.left, acc)
  collectNodes(node.right, acc)
  return acc
}

interface EdgeInfo { x1: number; y1: number; x2: number; y2: number }

function collectEdges(node: TreeNode | null, edges: EdgeInfo[] = []): EdgeInfo[] {
  if (!node) return edges
  if (node.left) {
    edges.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y })
    collectEdges(node.left, edges)
  }
  if (node.right) {
    edges.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y })
    collectEdges(node.right, edges)
  }
  return edges
}

function computeActiveThreads(steps: Step[]): Array<{ from: number; to: number }> {
  const active = new Map<string, { from: number; to: number }>()
  for (const s of steps) {
    const key = `${s.threadFrom}->${s.threadTo}`
    if (s.type === "thread_create" && s.threadFrom !== undefined && s.threadTo !== undefined) {
      active.set(key, { from: s.threadFrom, to: s.threadTo })
    } else if (s.type === "thread_remove" && s.threadFrom !== undefined && s.threadTo !== undefined) {
      active.delete(key)
    }
  }
  return Array.from(active.values())
}

// Base SVG coordinate space
const BASE_W = 800
const BASE_H = 420
const MIN_SCALE = 0.3
const MAX_SCALE = 5

interface ViewState { scale: number; ox: number; oy: number }

export default function TreeCanvas({
  tree,
  activeNodeVal,
  visitedSoFar,
  selectedNodeVal,
  onSelectNode,
  allStepsSoFar,
}: TreeCanvasProps) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // ── View state (scale + pan origin in SVG coords) ──────────────────────────
  const [view, setView] = useState<ViewState>({ scale: 1, ox: 0, oy: 0 })
  // Always-fresh ref so event handlers never capture stale closures
  const viewRef = useRef<ViewState>(view)
  useEffect(() => { viewRef.current = view }, [view])

  // ── Derived viewBox ─────────────────────────────────────────────────────────
  const vbW = BASE_W / view.scale
  const vbH = BASE_H / view.scale
  const viewBox = `${view.ox} ${view.oy} ${vbW} ${vbH}`

  // ── Wheel → zoom (pinch on trackpad sends ctrlKey=true) ────────────────────
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    function handler(e: WheelEvent) {
      e.preventDefault()
      e.stopPropagation()

      const svg = svgRef.current
      if (!svg) return

      const { scale, ox, oy } = viewRef.current
      const rect = svg.getBoundingClientRect()

      // Current viewBox dimensions
      const curVbW = BASE_W / scale
      const curVbH = BASE_H / scale

      // Cursor position in SVG coordinate space
      const cursorSvgX = ox + ((e.clientX - rect.left) / rect.width)  * curVbW
      const cursorSvgY = oy + ((e.clientY - rect.top)  / rect.height) * curVbH

      // Zoom factor — trackpad pinch arrives with ctrlKey=true
      const zoomDelta = e.ctrlKey
        ? -e.deltaY * 0.008   // pinch
        : -e.deltaY * 0.003   // scroll wheel / two-finger scroll

      const newScale  = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + zoomDelta)))
      const newVbW    = BASE_W / newScale
      const newVbH    = BASE_H / newScale

      // Anchor the cursor point so it stays stationary after zoom
      const newOx = cursorSvgX - ((e.clientX - rect.left) / rect.width)  * newVbW
      const newOy = cursorSvgY - ((e.clientY - rect.top)  / rect.height) * newVbH

      const next = { scale: newScale, ox: newOx, oy: newOy }
      viewRef.current = next
      setView(next)
    }

    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, []) // ← attached once; reads live data via viewRef

  // ── Mouse drag → pan ────────────────────────────────────────────────────────
  const dragOrigin = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: viewRef.current.ox, oy: viewRef.current.oy }
    setDragging(true)
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragOrigin.current || !svgRef.current) return
      const { scale } = viewRef.current
      const rect = svgRef.current.getBoundingClientRect()
      const vbW = BASE_W / scale
      const vbH = BASE_H / scale
      const dx = ((e.clientX - dragOrigin.current.mx) / rect.width)  * vbW
      const dy = ((e.clientY - dragOrigin.current.my) / rect.height) * vbH
      const next = { scale, ox: dragOrigin.current.ox - dx, oy: dragOrigin.current.oy - dy }
      viewRef.current = next
      setView(next)
    }
    function onMouseUp() {
      dragOrigin.current = null
      setDragging(false)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup",   onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup",   onMouseUp)
    }
  }, []) // attached once; reads live data via viewRef

  // ── Double-click → reset ────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    const next = { scale: 1, ox: 0, oy: 0 }
    viewRef.current = next
    setView(next)
  }, [])

  // ── Empty-tree placeholder ──────────────────────────────────────────────────
  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-4">
        <div className="border border-dashed border-zinc-700 rounded-sm px-8 py-12 text-center">
          <p className="text-zinc-500 text-sm">Empty tree</p>
          <p className="text-zinc-600 text-xs mt-1">Add nodes or load an example to begin</p>
        </div>
      </div>
    )
  }

  // ── Tree data ───────────────────────────────────────────────────────────────
  const allNodes      = collectNodes(tree)
  const nodeMap       = new Map(allNodes.map(n => [n.val, n]))
  const edges         = collectEdges(tree)
  const activeThreads = computeActiveThreads(allStepsSoFar)

  const threadLines = activeThreads.flatMap(t => {
    const from = nodeMap.get(t.from)
    const to   = nodeMap.get(t.to)
    if (!from || !to) return []
    return [{ x1: from.x, y1: from.y, x2: to.x, y2: to.y, key: `${t.from}-${t.to}` }]
  })

  function getNodeColors(val: number) {
    const isActive   = val === activeNodeVal
    const isSelected = val === selectedNodeVal
    const isVisited  = visitedSoFar.includes(val)
    if (isActive)   return { fill: "#ffffff", stroke: "#ffffff", text: "#000000" }
    if (isSelected) return { fill: "#3f3f46", stroke: "#a1a1aa", text: "#ffffff" }
    if (isVisited)  return { fill: "#27272a", stroke: "#71717a", text: "#a1a1aa" }
    return { fill: "#09090b", stroke: "#3f3f46", text: "#a1a1aa" }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="w-full h-full relative select-none"
      style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      onDoubleClick={resetView}
    >
      {/* Zoom indicator */}
      <div className="absolute top-2 right-2 z-10 pointer-events-none text-[10px] font-mono text-zinc-600"
           style={{ opacity: view.scale === 1 ? 0.4 : 0.85, transition: "opacity 0.2s" }}>
        {Math.round(view.scale * 100)}% · dbl-click reset
      </div>

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        style={{ display: "block" }}
        onMouseDown={onMouseDown}
      >
        {/* Edges */}
        {edges.map((e, i) => (
          <line key={`edge-${i}`}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#3f3f46" strokeWidth={1.5}
          />
        ))}

        {/* Morris threads */}
        {threadLines.map(tl => (
          <line key={tl.key}
            x1={tl.x1} y1={tl.y1} x2={tl.x2} y2={tl.y2}
            stroke="#f59e0b" strokeWidth={1.5}
            strokeDasharray="5 3" opacity={0.75}
          />
        ))}

        {/* Nodes */}
        {allNodes.map(node => {
          const colors   = getNodeColors(node.val)
          const isActive = node.val === activeNodeVal
          return (
            <g key={node.val}
               onClick={() => onSelectNode(node.val)}
               style={{ cursor: "pointer" }}>
              <circle
                cx={node.x} cy={node.y} r={20}
                fill={colors.fill} stroke={colors.stroke}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              {isActive && (
                <circle cx={node.x} cy={node.y} r={26}
                  fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2}
                />
              )}
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fill={colors.text}
                fontSize={node.val >= 100 ? 10 : 12}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={isActive ? 700 : 400}
                style={{ transition: "fill 0.2s", userSelect: "none" }}
              >
                {node.val}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

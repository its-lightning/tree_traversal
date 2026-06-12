// All shared TypeScript interfaces and types for the Binary Tree Traversal Demo.

// Matches the dict returned by tree_service.to_dict() exactly.
export interface TreeNode {
  val: number
  x: number
  y: number
  left: TreeNode | null
  right: TreeNode | null
}

// All observable step types across all 6 traversals.
export type StepType =
  | "visit"          // node is added to the output
  | "go_left"        // moving down to left child
  | "go_right"       // moving down to right child
  | "return"         // returning from a recursive call (standard only)
  | "thread_create"  // Morris: creating a temporary thread
  | "thread_remove"  // Morris: removing a temporary thread
  | "move_left"      // Morris: advancing curr = curr.left
  | "move_right"     // Morris: advancing curr = curr.right

// One observable unit of work during a traversal.
export interface Step {
  type: StepType
  node: number
  description: string
  visitedSoFar: number[]
  codeLine: number
  callStack: number[]    // recursive: active frames (bottom → top); Morris: always []
  // Optional: present only on thread_create and thread_remove steps
  threadFrom?: number
  threadTo?: number
}

export interface TraversalResult {
  name: string     // e.g. "Morris Inorder"
  steps: Step[]
  source: string[] // source code lines
}

export interface AppState {
  tree: TreeNode | null
  traversal: TraversalResult | null
  stepIndex: number          // -1 = not started
  selected: number | null    // user-clicked node value
}

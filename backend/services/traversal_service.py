"""
traversal_service.py — Six BST traversal algorithms with step capture.

Each function takes a root Node and returns a list of Step dicts.

Step dict shape:
  {
    "type":        str,      # visit | go_left | go_right | return |
                             # thread_create | thread_remove |
                             # move_left | move_right
    "node":        int,      # value of the node involved
    "description": str,      # human-readable sentence
    "visitedSoFar": list,    # output sequence up to this step
    "codeLine":    int,      # 1-based line in the DISPLAY source
    "callStack":   list,     # (recursive only) current call stack frames
  }
"""

import inspect
from services.tree_service import Node


# ─────────────────────────────────────────────────────────────────────────────
# 1. STANDARD INORDER  (left → visit → right)
# ─────────────────────────────────────────────────────────────────────────────

def inorder(root):
    steps = []
    visited = []
    call_stack = []

    def recurse(node):
        if node is None:
            return
        call_stack.append(node.val)
        if node.left is not None:
            steps.append({
                "type": "go_left",
                "node": node.val,
                "description": f"Move left from {node.val} to {node.left.val}",
                "visitedSoFar": list(visited),
                "codeLine": 3,
                "callStack": list(call_stack),
            })
        recurse(node.left)
        visited.append(node.val)
        steps.append({
            "type": "visit",
            "node": node.val,
            "description": f"Visit node {node.val} → add {node.val} to output",
            "visitedSoFar": list(visited),
            "codeLine": 4,
            "callStack": list(call_stack),
        })
        if node.right is not None:
            steps.append({
                "type": "go_right",
                "node": node.val,
                "description": f"Move right from {node.val} to {node.right.val}",
                "visitedSoFar": list(visited),
                "codeLine": 5,
                "callStack": list(call_stack),
            })
        recurse(node.right)
        call_stack.pop()

    recurse(root)
    return steps


# ─────────────────────────────────────────────────────────────────────────────
# 2. STANDARD PREORDER  (visit → left → right)
# ─────────────────────────────────────────────────────────────────────────────

def preorder(root):
    steps = []
    visited = []
    call_stack = []

    def recurse(node):
        if node is None:
            return
        call_stack.append(node.val)
        visited.append(node.val)
        steps.append({
            "type": "visit",
            "node": node.val,
            "description": f"Visit node {node.val} → add {node.val} to output",
            "visitedSoFar": list(visited),
            "codeLine": 3,
            "callStack": list(call_stack),
        })
        if node.left is not None:
            steps.append({
                "type": "go_left",
                "node": node.val,
                "description": f"Move left from {node.val} to {node.left.val}",
                "visitedSoFar": list(visited),
                "codeLine": 4,
                "callStack": list(call_stack),
            })
        recurse(node.left)
        if node.right is not None:
            steps.append({
                "type": "go_right",
                "node": node.val,
                "description": f"Move right from {node.val} to {node.right.val}",
                "visitedSoFar": list(visited),
                "codeLine": 5,
                "callStack": list(call_stack),
            })
        recurse(node.right)
        call_stack.pop()

    recurse(root)
    return steps


# ─────────────────────────────────────────────────────────────────────────────
# 3. STANDARD POSTORDER  (left → right → visit)
# ─────────────────────────────────────────────────────────────────────────────

def postorder(root):
    steps = []
    visited = []
    call_stack = []

    def recurse(node):
        if node is None:
            return
        call_stack.append(node.val)
        if node.left is not None:
            steps.append({
                "type": "go_left",
                "node": node.val,
                "description": f"Move left from {node.val} to {node.left.val}",
                "visitedSoFar": list(visited),
                "codeLine": 3,
                "callStack": list(call_stack),
            })
        recurse(node.left)
        if node.right is not None:
            steps.append({
                "type": "go_right",
                "node": node.val,
                "description": f"Move right from {node.val} to {node.right.val}",
                "visitedSoFar": list(visited),
                "codeLine": 4,
                "callStack": list(call_stack),
            })
        recurse(node.right)
        visited.append(node.val)
        steps.append({
            "type": "visit",
            "node": node.val,
            "description": f"Visit node {node.val} → add {node.val} to output",
            "visitedSoFar": list(visited),
            "codeLine": 5,
            "callStack": list(call_stack),
        })
        call_stack.pop()

    recurse(root)
    return steps


# ─────────────────────────────────────────────────────────────────────────────
# 4. MORRIS INORDER
# ─────────────────────────────────────────────────────────────────────────────

def morris_inorder(root):
    steps = []
    visited = []
    curr = root

    while curr is not None:
        if curr.left is None:
            visited.append(curr.val)
            steps.append({
                "type": "visit",
                "node": curr.val,
                "description": f"Visit node {curr.val} → add {curr.val} to output",
                "visitedSoFar": list(visited),
                "codeLine": 5,
                "callStack": [],
            })
            next_node = curr.right
            steps.append({
                "type": "move_right",
                "node": curr.val,
                "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                "visitedSoFar": list(visited),
                "codeLine": 6,
                "callStack": [],
            })
            curr = next_node
        else:
            pre = curr.left
            while pre.right is not None and pre.right is not curr:
                pre = pre.right

            if pre.right is None:
                steps.append({
                    "type": "thread_create",
                    "node": curr.val,
                    "description": f"Create thread: {pre.val} → {curr.val}  (Morris link)",
                    "visitedSoFar": list(visited),
                    "codeLine": 10,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = curr
                next_node = curr.left
                steps.append({
                    "type": "move_left",
                    "node": curr.val,
                    "description": f"Advance curr left: {curr.val} → {curr.left.val}",
                    "visitedSoFar": list(visited),
                    "codeLine": 11,
                    "callStack": [],
                })
                curr = next_node
            else:
                steps.append({
                    "type": "thread_remove",
                    "node": curr.val,
                    "description": f"Remove thread: {pre.val} → {curr.val}  (restore tree)",
                    "visitedSoFar": list(visited),
                    "codeLine": 13,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = None
                visited.append(curr.val)
                steps.append({
                    "type": "visit",
                    "node": curr.val,
                    "description": f"Visit node {curr.val} → add {curr.val} to output",
                    "visitedSoFar": list(visited),
                    "codeLine": 14,
                    "callStack": [],
                })
                next_node = curr.right
                steps.append({
                    "type": "move_right",
                    "node": curr.val,
                    "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                    "visitedSoFar": list(visited),
                    "codeLine": 15,
                    "callStack": [],
                })
                curr = next_node

    return steps


# ─────────────────────────────────────────────────────────────────────────────
# 5. MORRIS PREORDER
# ─────────────────────────────────────────────────────────────────────────────

def morris_preorder(root):
    steps = []
    visited = []
    curr = root

    while curr is not None:
        if curr.left is None:
            visited.append(curr.val)
            steps.append({
                "type": "visit",
                "node": curr.val,
                "description": f"Visit node {curr.val} → add {curr.val} to output",
                "visitedSoFar": list(visited),
                "codeLine": 5,
                "callStack": [],
            })
            next_node = curr.right
            steps.append({
                "type": "move_right",
                "node": curr.val,
                "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                "visitedSoFar": list(visited),
                "codeLine": 6,
                "callStack": [],
            })
            curr = next_node
        else:
            pre = curr.left
            while pre.right is not None and pre.right is not curr:
                pre = pre.right

            if pre.right is None:
                visited.append(curr.val)
                steps.append({
                    "type": "visit",
                    "node": curr.val,
                    "description": f"Visit node {curr.val} → add {curr.val} to output",
                    "visitedSoFar": list(visited),
                    "codeLine": 10,
                    "callStack": [],
                })
                steps.append({
                    "type": "thread_create",
                    "node": curr.val,
                    "description": f"Create thread: {pre.val} → {curr.val}  (Morris link)",
                    "visitedSoFar": list(visited),
                    "codeLine": 11,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = curr
                next_node = curr.left
                steps.append({
                    "type": "move_left",
                    "node": curr.val,
                    "description": f"Advance curr left: {curr.val} → {curr.left.val}",
                    "visitedSoFar": list(visited),
                    "codeLine": 12,
                    "callStack": [],
                })
                curr = next_node
            else:
                steps.append({
                    "type": "thread_remove",
                    "node": curr.val,
                    "description": f"Remove thread: {pre.val} → {curr.val}  (restore tree)",
                    "visitedSoFar": list(visited),
                    "codeLine": 14,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = None
                next_node = curr.right
                steps.append({
                    "type": "move_right",
                    "node": curr.val,
                    "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                    "visitedSoFar": list(visited),
                    "codeLine": 15,
                    "callStack": [],
                })
                curr = next_node

    return steps


# ─────────────────────────────────────────────────────────────────────────────
# 6. MORRIS POSTORDER
# ─────────────────────────────────────────────────────────────────────────────

def morris_postorder(root):
    steps = []
    visited = []

    def reverse_path(from_node, to_node):
        path = []
        node = from_node
        while True:
            path.append(node)
            if node is to_node:
                break
            node = node.right
        for n in reversed(path):
            visited.append(n.val)
            steps.append({
                "type": "visit",
                "node": n.val,
                "description": f"Visit node {n.val} → add {n.val} to output",
                "visitedSoFar": list(visited),
                "codeLine": 10,
                "callStack": [],
            })

    dummy = Node(0)
    dummy.left = root
    curr = dummy

    while curr is not None:
        if curr.left is None:
            next_node = curr.right
            steps.append({
                "type": "move_right",
                "node": curr.val,
                "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                "visitedSoFar": list(visited),
                "codeLine": 6,
                "callStack": [],
            })
            curr = next_node
        else:
            pre = curr.left
            while pre.right is not None and pre.right is not curr:
                pre = pre.right

            if pre.right is None:
                steps.append({
                    "type": "thread_create",
                    "node": curr.val,
                    "description": f"Create thread: {pre.val} → {curr.val}  (Morris link)",
                    "visitedSoFar": list(visited),
                    "codeLine": 10,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = curr
                next_node = curr.left
                steps.append({
                    "type": "move_left",
                    "node": curr.val,
                    "description": f"Advance curr left: {curr.val} → {curr.left.val}",
                    "visitedSoFar": list(visited),
                    "codeLine": 11,
                    "callStack": [],
                })
                curr = next_node
            else:
                steps.append({
                    "type": "thread_remove",
                    "node": curr.val,
                    "description": f"Remove thread: {pre.val} → {curr.val}  (restore tree)",
                    "visitedSoFar": list(visited),
                    "codeLine": 13,
                    "callStack": [],
                    "threadFrom": pre.val,
                    "threadTo": curr.val,
                })
                pre.right = None
                reverse_path(curr.left, pre)
                next_node = curr.right
                steps.append({
                    "type": "move_right",
                    "node": curr.val,
                    "description": f"Advance curr right: {curr.val} → {curr.right.val if curr.right else 'None'}",
                    "visitedSoFar": list(visited),
                    "codeLine": 15,
                    "callStack": [],
                })
                curr = next_node

    return steps


# ─────────────────────────────────────────────────────────────────────────────
# Clean display sources — what the UI shows (no step.append noise)
# Line numbers here correspond to codeLine values in the steps above.
# ─────────────────────────────────────────────────────────────────────────────

DISPLAY_SOURCES: dict[str, list[str]] = {
    "inorder": [
        "def _inorder(self, root):",
        "    if root is None: return",
        "    self._inorder(root.left)",
        "    print(root.data)  # visit",
        "    self._inorder(root.right)",
    ],
    "preorder": [
        "def _preorder(self, root):",
        "    if root is None: return",
        "    print(root.data)  # visit",
        "    self._preorder(root.left)",
        "    self._preorder(root.right)",
    ],
    "postorder": [
        "def _postorder(self, root):",
        "    if root is None: return",
        "    self._postorder(root.left)",
        "    self._postorder(root.right)",
        "    print(root.data)  # visit",
    ],
    "morris_inorder": [
        "def morris_inorder(root):",
        "    curr = root",
        "    while curr:",
        "        if curr.left is None:",
        "            res.append(curr.data)",
        "            curr = curr.right",
        "        else:",
        "            prev = inorder_predecessor(curr)",
        "            if prev.right is None:",
        "                prev.right = curr",
        "                curr = curr.left",
        "            else:",
        "                prev.right = None",
        "                res.append(curr.data)",
        "                curr = curr.right",
    ],
    "morris_preorder": [
        "def morris_preorder(root):",
        "    curr = root",
        "    while curr:",
        "        if curr.left is None:",
        "            res.append(curr.data)",
        "            curr = curr.right",
        "        else:",
        "            prev = inorder_predecessor(curr)",
        "            if prev.right is None:",
        "                res.append(curr.data)",
        "                prev.right = curr",
        "                curr = curr.left",
        "            else:",
        "                prev.right = None",
        "                curr = curr.right",
    ],
    "morris_postorder": [
        "def morris_postorder(root):",
        "    dummy = Node(0); dummy.left = root",
        "    curr = dummy",
        "    while curr:",
        "        if curr.left is None:",
        "            curr = curr.right",
        "        else:",
        "            prev = inorder_predecessor(curr)",
        "            if prev.right is None:",
        "                prev.right = curr",
        "                curr = curr.left",
        "            else:",
        "                prev.right = None",
        "                res += reverse_path(curr.left, prev)",
        "                curr = curr.right",
    ],
}

DISPLAY_NAMES: dict[str, str] = {
    "inorder":           "Inorder",
    "preorder":          "Preorder",
    "postorder":         "Postorder",
    "morris_inorder":    "Morris Inorder",
    "morris_preorder":   "Morris Preorder",
    "morris_postorder":  "Morris Postorder",
}

TRAVERSAL_FNS = {
    "inorder":           inorder,
    "preorder":          preorder,
    "postorder":         postorder,
    "morris_inorder":    morris_inorder,
    "morris_preorder":   morris_preorder,
    "morris_postorder":  morris_postorder,
}

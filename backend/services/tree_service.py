"""
tree_service.py — BST node class, insert, delete, and tree→dict conversion.
The tree root is a module-level global. No database. No session.
"""

# ── The entire tree state ────────────────────────────────────────────────────
root = None


# ── Node class ───────────────────────────────────────────────────────────────
class Node:
    def __init__(self, val: int):
        self.val = val
        self.left = None   # Node | None
        self.right = None  # Node | None


# ── BST insert ───────────────────────────────────────────────────────────────
def insert(val: int) -> bool:
    """Insert val into the BST. Returns False if val already exists."""
    global root
    if root is None:
        root = Node(val)
        return True
    return _insert(root, val)


def _insert(node: Node, val: int) -> bool:
    if val == node.val:
        return False  # duplicate
    if val < node.val:
        if node.left is None:
            node.left = Node(val)
            return True
        return _insert(node.left, val)
    else:
        if node.right is None:
            node.right = Node(val)
            return True
        return _insert(node.right, val)


# ── BST delete ───────────────────────────────────────────────────────────────
def delete(val: int) -> bool:
    """Delete val from the BST. Returns False if val not found."""
    global root
    found = [False]
    root = _delete(root, val, found)
    return found[0]


def _delete(node, val: int, found: list) -> object:
    if node is None:
        return None
    if val < node.val:
        node.left = _delete(node.left, val, found)
    elif val > node.val:
        node.right = _delete(node.right, val, found)
    else:
        found[0] = True
        # Node with one or no child
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left
        # Node with two children: replace with inorder successor
        successor = _min_node(node.right)
        node.val = successor.val
        node.right = _delete(node.right, successor.val, [True])
    return node


def _min_node(node: Node) -> Node:
    curr = node
    while curr.left is not None:
        curr = curr.left
    return curr


# ── Reset ─────────────────────────────────────────────────────────────────────
def reset() -> None:
    global root
    root = None


# ── Load example tree ─────────────────────────────────────────────────────────
def load_example() -> None:
    """Inserts 15 nodes producing a fully-filled depth-4 BST."""
    global root
    root = None
    # Insert level-by-level to guarantee a complete BST shape:
    # Level 1: 50
    # Level 2: 25, 75
    # Level 3: 12, 37, 62, 87
    # Level 4: 6, 18, 31, 43, 56, 68, 81, 93
    for val in [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93]:
        insert(val)


# ── Tree → JSON-serialisable dict ─────────────────────────────────────────────
def to_dict(node, x: int, y: int, gap: int) -> dict | None:
    if node is None:
        return None
    return {
        "val":   node.val,
        "x":     x,
        "y":     y,
        "left":  to_dict(node.left,  x - gap, y + 90, gap // 2),
        "right": to_dict(node.right, x + gap, y + 90, gap // 2),
    }


def get_tree_dict() -> dict | None:
    # gap=320 gives enough horizontal spread for 4 levels (8 leaves need ~80px each)
    return to_dict(root, 400, 50, 320)

from flask import Blueprint, jsonify, request
from services import tree_service, traversal_service

api_bp = Blueprint("api", __name__)

VALID_TRAVERSALS = {
    "inorder", "preorder", "postorder",
    "morris_inorder", "morris_preorder", "morris_postorder",
}


# ── Health ────────────────────────────────────────────────────────────────────
@api_bp.route("/health")
def health():
    return jsonify({"status": "ok"})


# ── GET /api/tree ─────────────────────────────────────────────────────────────
@api_bp.route("/tree", methods=["GET"])
def get_tree():
    return jsonify({"tree": tree_service.get_tree_dict()})


# ── POST /api/tree/add ────────────────────────────────────────────────────────
@api_bp.route("/tree/add", methods=["POST"])
def add_node():
    data = request.get_json(force=True)
    val = data.get("val")
    if not isinstance(val, int):
        return jsonify({"error": "val must be an integer"}), 400
    ok = tree_service.insert(val)
    if not ok:
        return jsonify({"error": f"{val} already exists in the tree"}), 409
    return jsonify({"tree": tree_service.get_tree_dict()})


# ── POST /api/tree/delete ─────────────────────────────────────────────────────
@api_bp.route("/tree/delete", methods=["POST"])
def delete_node():
    data = request.get_json(force=True)
    val = data.get("val")
    if not isinstance(val, int):
        return jsonify({"error": "val must be an integer"}), 400
    ok = tree_service.delete(val)
    if not ok:
        return jsonify({"error": f"{val} not found in tree"}), 404
    return jsonify({"tree": tree_service.get_tree_dict()})


# ── POST /api/tree/reset ──────────────────────────────────────────────────────
@api_bp.route("/tree/reset", methods=["POST"])
def reset_tree():
    tree_service.reset()
    return jsonify({"tree": None})


# ── POST /api/tree/example ────────────────────────────────────────────────────
@api_bp.route("/tree/example", methods=["POST"])
def load_example():
    tree_service.load_example()
    return jsonify({"tree": tree_service.get_tree_dict()})


# ── GET /api/traversal/<name> ─────────────────────────────────────────────────
@api_bp.route("/traversal/<name>", methods=["GET"])
def run_traversal(name: str):
    if name not in VALID_TRAVERSALS:
        return jsonify({
            "error": f"Unknown traversal '{name}'. Valid options: {sorted(VALID_TRAVERSALS)}"
        }), 400

    if tree_service.root is None:
        return jsonify({"error": "Tree is empty. Add some nodes first."}), 404

    fn = traversal_service.TRAVERSAL_FNS[name]
    steps = fn(tree_service.root)
    source = traversal_service.DISPLAY_SOURCES[name]
    display_name = traversal_service.DISPLAY_NAMES[name]

    return jsonify({
        "name":   display_name,
        "steps":  steps,
        "source": source,
    })

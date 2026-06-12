from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from routes.api import api_bp
import os


def create_app():
    # In Docker the Vite build lands in ./static next to app.py
    static_dir = os.path.join(os.path.dirname(__file__), "static")

    flask_app = Flask(
        __name__,
        static_folder=static_dir,
        static_url_path="/",
    )
    flask_app.config.from_object(Config)

    # Allow any origin so a Cloudflare tunnel URL works without hardcoding
    CORS(flask_app, resources={r"/api/*": {"origins": "*"}})

    flask_app.register_blueprint(api_bp, url_prefix="/api")

    # Serve the React app for every non-API route (supports React Router)
    @flask_app.route("/", defaults={"path": ""})
    @flask_app.route("/<path:path>")
    def serve_frontend(path):
        file_path = os.path.join(flask_app.static_folder, path)
        if path and os.path.exists(file_path):
            return send_from_directory(flask_app.static_folder, path)
        return send_from_directory(flask_app.static_folder, "index.html")

    return flask_app


# Top-level `app` required by Vercel's Python runtime (static AST scan)
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5050)


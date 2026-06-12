from flask import Flask
from flask_cors import CORS
from config import Config
from routes.api import api_bp


def create_app():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    CORS(flask_app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "http://localhost:5174",
        r"https://.*\.vercel\.app",
    ]}})

    flask_app.register_blueprint(api_bp, url_prefix="/api")

    return flask_app


# Top-level `app` required by Vercel's Python runtime (static AST scan)
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5050)

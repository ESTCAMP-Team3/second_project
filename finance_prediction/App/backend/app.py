from flask import Flask, send_from_directory
from flask_cors import CORS
from config.config import Config
from routes import register_routes
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config.from_object(Config)
    CORS(app)

    # 라우터 등록
    register_routes(app)

    # React 앱 서빙
    @app.route('/')
    def serve_react_app():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static_files(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return {"success": False, "error": "Endpoint not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"success": False, "error": "Internal server error"}, 500

    return app


if __name__ == '__main__':
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    app = create_app()
    app.run(host=host, port=port, debug=debug)
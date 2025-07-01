from .base import base_bp
from .predict import predict_bp
from .train import train_bp

def register_routes(app):
    app.register_blueprint(base_bp)
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(train_bp, url_prefix='/api/train')
from .base import base_bp
from .prophet_predict import predict_bp
from .train import train_bp
from .cluster_predict import cluster_predict_bp
from .cluster_train import cluster_train_bp

def register_routes(app):
    app.register_blueprint(base_bp)
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(train_bp, url_prefix='/api/train')
    app.register_blueprint(cluster_predict_bp, url_prefix='/api/cluster/predict')
    app.register_blueprint(cluster_train_bp, url_prefix='/api/cluster/train')
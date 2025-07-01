from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_prediction_model import StockPredictionModel
from utils.validators import validate_prediction_request, validate_stock_symbol
from datetime import timedelta
import pandas as pd

predict_bp = Blueprint('predict', __name__)
data_fetcher = DataFetcher()
prediction_model = StockPredictionModel()

@predict_bp.route('/<symbol>', methods=['POST'])
def predict_stock(symbol):
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'잘못된 주식 심볼: {symbol}'}), 400

        request_data = request.get_json() or {}
        days = request_data.get('days', 5)

        if not isinstance(days, int) or days < 1 or days > 5:
            return jsonify({'success': False, 'error': '예측 일수는 1-5일 사이여야 합니다'}), 400

        current_app.logger.info(f"{symbol} 예측 시작, 예측 일수: {days}일")

        stock_data = data_fetcher.get_stock_data(symbol)
        if stock_data.empty:
            return jsonify({'success': False, 'error': f'{symbol} 데이터를 가져올 수 없습니다'}), 400

        prediction_model.train_model(symbol, stock_data)

        # 예측 결과 가져오기 (days보다 넉넉히 예측)
        forecast = prediction_model.predict(symbol, days=days+7)

        # 오늘 기준으로 영업일(평일)만 뽑기
        today = pd.Timestamp.today().normalize()

        def is_weekday(date):
            return date.weekday() < 5  # 월~금만 True

        business_days = []
        for i in range(1, 20):  # 최대 20일 탐색해 days개 수집
            day = today + timedelta(days=i)
            if is_weekday(day):
                business_days.append(day)
            if len(business_days) == days:
                break

        business_days_ts = pd.to_datetime(business_days)

        filtered_forecast = forecast[forecast["ds"].isin(business_days_ts)].reset_index(drop=True)

        # 결과 준비
        result = {}
        for i in range(len(filtered_forecast)):
            row = filtered_forecast.iloc[i]
            result[str(i+1)] = {  # 1부터 시작하는 인덱스가 더 직관적임
                "dates": [str(row["ds"].date())],
                "values": [float(row["yhat"])]
            }

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        current_app.logger.error(f"{symbol} 예측 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 예측 실패'}), 500
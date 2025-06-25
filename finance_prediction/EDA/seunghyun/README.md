- `yf_explore.ipynb`:  
     yfinance 기본 기능 탐색, S&P500 sector 구조 추출, ARIMA 시도까지 이어진 흐름 정리, 테스트용  

- `0625_EDA1.ipynb`:
     배당 및 조정 종가 관련 EDA 실험 노트북

     본 실험에서는 Apple 종목을 기준으로 yfinance 데이터를 활용하여 다음을 실험하였습니다:

     - 배당금 지급일에 실제 주가(`Close`)가 얼마나 하락하는지
     - `auto_adjust` 설정 유무에 따른 주가 조정 방식 차이
     - `Adj Close`의 조정 범위 및 의미 해석
     - `Dividends` 컬럼의 예측 피처로서의 적절성 판단

     하지만 검색 결과 auto_adjust=True 가 기본값이고
     별 다른 변수 조절없이 그냥 있는대로 close 등을 사용하면 되겠습니다.
     

     결론적으로 본 프로젝트에서는 `Close`(auto_adjust=True는 자동으로 Close가 Adj Close)를 사용하고,
     `Dividends` 컬럼은 분석 참고용으로만 활용하거나, 추후 종목별 기술적 지표 심화에 사용하면 좋을거 같습니다.
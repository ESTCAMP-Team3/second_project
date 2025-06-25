- `yf_explore.ipynb`:  
     yfinance 기본 기능 탐색, S&P500 sector 구조 추출, ARIMA 시도까지 이어진 흐름 정리, 테스트용  

- `0625_EDA1.ipynb`:
     배당 및 조정 종가 관련 EDA 실험 노트북

     Apple 주식 데이터를 기반으로 yfinance의 auto_adjust 설정에 따라
     배당락(Dividends) 및 액면분할(Splits) 발생 시 종가 변화가 어떻게 보정되는지 실험함

     배당일 전후의 Close, Adj Close, Dividends 값을 비교하여
     조정 주가의 해석 방식과 실제 반영 효과를 시각적으로 검토

     ✅ 실험 결과 요약
     auto_adjust=True일 경우,

     Close는 이미 Adj Close로 보정되어 제공됨

     배당/분할 이벤트로 인한 급격한 주가 변동이 제거되어 시계열 예측에 적합

     따라서 Close만으로도 안정적인 예측 학습이 가능하며
     Dividends, Stock Splits 컬럼은 별도 보정 없이도 제외 가능

     📌 프로젝트 방침
     본 프로젝트에서는 yfinance 기본 설정(auto_adjust=True)을 그대로 사용

     Close 컬럼을 예측 대상 및 피처로 사용하며,
     Dividends, Splits는 필요 시 참고용으로만 활용
## Stock Price Prediction Using Deep Learning Algorithms Based on Technical Indicators

[(PDF) Stock Price Prediction Using Deep Learning Algorithms Based on Technical Indicators](https://www.researchgate.net/publication/383102038_Stock_Price_Prediction_Using_Deep_Learning_Algorithms_Based_on_Technical_Indicators)

### 1. Overall Flow

| 구분          | 내용                       |
| ----------- | ------------------------ |
| 종목 (Ticker) | Apple Inc. (AAPL)        |
| 데이터 기간      | 2015-01-01 \~ 2022-12-31 |
| 데이터 인터벌     | 일간 (Daily)               |

### 2. Raw Dataset Features

| Feature | 설명            |
| ------- | ------------- |
| Open    | 일일 시가         |
| High    | 일일 고가         |
| Low     | 일일 저가         |
| Close   | 일일 종가 (예측 대상) |
| Volume  | 일일 거래량        |

### 3. Technical Indicators

| 지표                    | 파라미터             | 설명                            |
| --------------------- | ---------------- | ----------------------------- |
| SMA                   | window=20        | 20일 단순 이동평균                   |
| EMA                   | window=20        | 20일 지수 이동평균                   |
| RSI                   | window=14        | 14일 상대강도지수                    |
| MACD                  | (12,26,9)        | 단기 EMA(12)–장기 EMA(26), 시그널(9) |
| Bollinger Bands       | window=20, std=2 | ±2σ 범위 밴드                     |
| Stochastic Oscillator | %K=14, %D=3      | %K: 14일, %D: 3일 이동평균          |

### 4. Preprocessing

| 단계     | 설명                              |
| ------ | ------------------------------- |
| 결측치 처리 | 전일 값으로 전진 채움 (forward-fill)     |
| 정규화    | Min–Max 스케일링 → [0,1] 범위         |
| 피처 선택  | 피처별 상관계수 계산 → 상관계수 < 0.1인 항목 제외 |

### 5. Data Splitting & Windowing

| 구분          | 기간/파라미터                  | 설명                       |
| ----------- | ------------------------ | ------------------------ |
| Train       | 2015-01-01 \~ 2021-12-31 | 약 1,600 거래일              |
| Validation  | Train 데이터의 10% 랜덤 분리     | EarlyStopping 모니터링용      |
| Test        | 2022-01-01 \~ 2022-12-31 | 약 250 거래일                |
| Window Size | 60일                      | 과거 60일 시퀀스로 ‘다음 날 종가’ 예측 |

### 6. Models & Performance

| 모델                | 주요 구조                                                        | Test RMSE |
| ----------------- | ------------------------------------------------------------ | --------- |
| Single Layer LSTM | LSTM(50) + Dropout(0.2) + Dense(1)                           | 1.82      |
| 3-Layer LSTM      | LSTM(50, return\_seq)x2 + LSTM(50) + Dropout(0.2) + Dense(1) | 1.96      |
| 3-Layer BiLSTM    | BiLSTM(50)x3 + Dropout(0.2) + Dense(1)                       | 1.89      |
| CNN-LSTM Hybrid   | Conv1D(64,3)+MaxPool → LSTM(50) + Dropout(0.2) + Dense(1)    | 2.03      |


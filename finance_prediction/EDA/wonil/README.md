# 📈 주가 시계열 예측 프로젝트 (LSTM & GRU 기반)

본 프로젝트는 미국 주요 종목 10개(Tesla, Apple, Nvidia, Microsoft, Amazon, AMD, Meta, Alphabet, SPY, QQQ)를 대상으로  
기술적 지표를 활용하여 **단기 상승 가능성 예측 모델**을 LSTM 및 GRU 기반으로 구축한 실험 프로젝트입니다.

## 🧠 모델 구조 LSTM / GRU 모델
- 시퀀스 길이: 20일
- 구조:
  - LSTM/GRU (64) → Dropout(0.3) → LSTM/GRU (32) → Dense(1, sigmoid)
- 학습 설정:
  - Loss: Binary Crossentropy
  - Optimizer: Adam
  - EarlyStopping 적용
  - 클래스 불균형 보정: `class_weight='balanced'`

## 결과 요약
| 모델 | Accuracy | 상승 Precision | 상승 Recall | 상승 F1 |
|------|----------|----------------|--------------|----------|
| LSTM | 0.68     | 0.46           | 0.42         | 0.44     |
| GRU  | 0.67     | 0.45           | 0.57         | 0.50     |

- 대부분 **하락 예측은 양호(정확도 75~80%)**
- 상승 예측은 **Precision, Recall 모두 50% 이하**
- ➜ **단기 상승 예측의 신호는 기술적 지표만으로 충분하지 않음**


## 🤔 한계점 및 개선 방향
### 한계
- 라벨 정의 기준(2% 상승)은 다소 임의적이고 noise에 민감함
- 기술적 지표만으로 상승을 설명하기에는 정보 부족
- 종목 간 변동성과 특성 차이가 모델 성능 저해 가능

### 개선 방향
- 라벨 재정의 (예: 3일 내 +5% 도달 여부 등)
- MACD, RSI, Bollinger Band 등 피처 추가
- Attention 기반 모델(TFT, Transformer) 적용
- 멀티모달(뉴스, ETF, 수급) 정보 통합 고려

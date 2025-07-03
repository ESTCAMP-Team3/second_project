import os
import json
from datetime import datetime
from typing import Dict, Any, Optional, List


class ModelManager:
    """모델 존재 여부 확인 및 관리를 위한 유틸리티 클래스"""
    
    def __init__(self, models_dir: str = "saved_models"):
        self.models_dir = models_dir
        self.ensure_models_dir()
    
    def ensure_models_dir(self):
        """모델 저장 디렉토리 생성"""
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)
    
    def generate_model_filename(self, model_name: str, symbol: str) -> str:
        """모델 파일명 생성: 모델명_심볼_날짜.pkl"""
        date_str = datetime.now().strftime("%Y%m%d")
        return f"{model_name}_{symbol}_{date_str}.pkl"
    
    def get_model_path(self, model_name: str, symbol: str) -> str:
        """모델 파일 경로 반환"""
        filename = self.generate_model_filename(model_name, symbol)
        return os.path.join(self.models_dir, filename)
    
    def model_exists(self, model_name: str, symbol: str) -> bool:
        """모델 존재 여부 확인"""
        model_path = self.get_model_path(model_name, symbol)
        return os.path.exists(model_path)
    
    def get_existing_model_path(self, model_name: str, symbol: str) -> Optional[str]:
        """기존 모델 경로 반환 (날짜 상관없이 가장 최근 모델)"""
        pattern = f"{model_name}_{symbol}_"
        
        if not os.path.exists(self.models_dir):
            return None
        
        matching_files = [
            f for f in os.listdir(self.models_dir)
            if f.startswith(pattern) and f.endswith('.pkl')
        ]
        
        if not matching_files:
            return None
        
        # 날짜 순으로 정렬하여 가장 최근 모델 반환
        matching_files.sort(reverse=True)
        return os.path.join(self.models_dir, matching_files[0])
    
    def save_model_metadata(self, model_name: str, symbol: str, metadata: Dict[str, Any]):
        """모델 메타데이터 저장"""
        filename = self.generate_model_filename(model_name, symbol).replace('.pkl', '_metadata.json')
        metadata_path = os.path.join(self.models_dir, filename)
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    def load_model_metadata(self, model_name: str, symbol: str) -> Optional[Dict[str, Any]]:
        """모델 메타데이터 로드"""
        filename = self.generate_model_filename(model_name, symbol).replace('.pkl', '_metadata.json')
        metadata_path = os.path.join(self.models_dir, filename)
        
        if not os.path.exists(metadata_path):
            return None
        
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None
    
    def get_model_info(self, model_name: str, symbol: str) -> Optional[Dict[str, Any]]:
        """모델 정보 반환"""
        model_path = self.get_existing_model_path(model_name, symbol)
        if not model_path:
            return None
        
        metadata = self.load_model_metadata(model_name, symbol)
        
        # 파일 정보
        file_stat = os.stat(model_path)
        
        info = {
            'model_name': model_name,
            'symbol': symbol,
            'file_path': model_path,
            'file_size': file_stat.st_size,
            'created_at': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
            'modified_at': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            'metadata': metadata
        }
        
        return info
    
    def list_models(self) -> List[Dict[str, Any]]:
        """저장된 모든 모델 목록 반환"""
        if not os.path.exists(self.models_dir):
            return []
        
        models = []
        model_files = [f for f in os.listdir(self.models_dir) if f.endswith('.pkl')]
        
        for model_file in model_files:
            parts = model_file.replace('.pkl', '').split('_')
            if len(parts) >= 3:
                model_name = parts[0]
                symbol = parts[1]
                info = self.get_model_info(model_name, symbol)
                if info:
                    models.append(info)
        
        return models
    
    def delete_model(self, model_name: str, symbol: str) -> bool:
        """모델 삭제"""
        model_path = self.get_existing_model_path(model_name, symbol)
        if not model_path:
            return False
        
        try:
            # 모델 파일 삭제
            os.remove(model_path)
            
            # 메타데이터 파일 삭제
            metadata_path = model_path.replace('.pkl', '_metadata.json')
            if os.path.exists(metadata_path):
                os.remove(metadata_path)
            
            return True
        except OSError:
            return False
    
    def cleanup_old_models(self, model_name: str, symbol: str, keep_count: int = 3):
        """오래된 모델 정리 (최신 N개만 유지)"""
        pattern = f"{model_name}_{symbol}_"
        
        if not os.path.exists(self.models_dir):
            return
        
        matching_files = [
            f for f in os.listdir(self.models_dir)
            if f.startswith(pattern) and f.endswith('.pkl')
        ]
        
        if len(matching_files) <= keep_count:
            return
        
        # 날짜 순으로 정렬 (오래된 것부터)
        matching_files.sort()
        
        # 오래된 파일들 삭제
        for file_to_delete in matching_files[:-keep_count]:
            try:
                os.remove(os.path.join(self.models_dir, file_to_delete))
                
                # 메타데이터 파일도 삭제
                metadata_file = file_to_delete.replace('.pkl', '_metadata.json')
                metadata_path = os.path.join(self.models_dir, metadata_file)
                if os.path.exists(metadata_path):
                    os.remove(metadata_path)
            except OSError:
                pass


# 전역 모델 매니저 인스턴스
model_manager = ModelManager()
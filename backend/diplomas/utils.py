import hashlib

def hash_diploma_number(series_number: str, salt: str) -> str:
    """Возвращает SHA-256 хэш от строки 'серия+номер' + соль"""
    combined = f"{series_number}{salt}"
    return hashlib.sha256(combined.encode('utf-8')).hexdigest()
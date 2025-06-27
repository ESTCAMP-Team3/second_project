/**
 * 큰 숫자를 축약 형태로 포맷팅 (예: 1,000,000 → 1M)
 */
export const formatLargeNumber = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (date: string | Date): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return '';
    }

    return dateObj.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * 상대적 시간 포맷팅 (예: 5분 전, 1시간 전)
 */
export const formatRelativeTime = (date: string | Date): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return formatDate(dateObj);
};
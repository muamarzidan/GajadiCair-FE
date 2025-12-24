const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format date from ISO string to readable format with UTC+7 timezone
 * Backend returns UTC time, so we need to adjust to WIB (UTC+7)
 * @param dateString - ISO date string from backend
 * @param format - 'short' (26 Des 2025) or 'long' (26 Desember 2025) or 'full' (Kamis, 26 Desember 2025)
 * @returns Formatted date string in WIB timezone
 */
export const formatDateUTC7 = (
    dateString: string | null, 
    format: 'short' | 'long' | 'full' = 'short'
): string => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        
        // Add 7 hours for UTC+7 (WIB)
        date.setHours(date.getHours() + 7);
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };
        
        if (format === 'full') {
            options.weekday = 'long';
        }
        
        return date.toLocaleDateString('id-ID', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};

/**
 * Format date range with UTC+7 timezone
 * @param startDate - Start date ISO string
 * @param endDate - End date ISO string
 * @returns Formatted date range string (e.g., "26 Des - 29 Des 2025" or "26 Des 2025" if same day)
 */
export const formatDateRangeUTC7 = (
    startDate: string | null,
    endDate: string | null
): string => {
    if (!startDate || !endDate) return '-';
    
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Add 7 hours for UTC+7 (WIB)
        start.setHours(start.getHours() + 7);
        end.setHours(end.getHours() + 7);
        
        const startDay = start.getDate();
        const startMonth = start.toLocaleDateString('id-ID', { month: 'short', timeZone: 'UTC' });
        const startYear = start.getFullYear();
        
        const endDay = end.getDate();
        const endMonth = end.toLocaleDateString('id-ID', { month: 'short', timeZone: 'UTC' });
        const endYear = end.getFullYear();
        
        // Same day
        if (startDate === endDate || 
            (startDay === endDay && startMonth === endMonth && startYear === endYear)) {
            return `${startDay} ${startMonth} ${startYear}`;
        }
        
        // Same month and year
        if (startMonth === endMonth && startYear === endYear) {
            return `${startDay} - ${endDay} ${endMonth} ${startYear}`;
        }
        
        // Same year, different month
        if (startYear === endYear) {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        }
        
        // Different year
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    } catch (error) {
        console.error('Error formatting date range:', error);
        return '-';
    }
};

export default formatDate;
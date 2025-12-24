export interface Holiday {
    company_custom_holiday_id: string;
    company_id: string;
    start_date: string;
    end_date: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};
export interface CreateHolidayRequest {
    start_date: string;
    end_date: string;
    description: string;
};
export interface UpdateHolidayRequest {
    start_date?: string;
    end_date?: string;
    description?: string;
};
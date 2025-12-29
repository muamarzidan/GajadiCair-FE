import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { holidayApi, type Holiday, type CreateHolidayRequest, type UpdateHolidayRequest } from '@/services/holiday';

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
  onSuccess: () => void;
}

export const HolidayFormDialog = ({
  open,
  onOpenChange,
  holiday,
  onSuccess,
}: HolidayFormDialogProps) => {
  const isEdit = !!holiday;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert ISO date string to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (isoDateString: string): string => {
    try {
      const date = new Date(isoDateString);
      // Add 7 hours for UTC+7 (WIB)
      date.setHours(date.getHours() + 7);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Reset form when dialog opens/closes or employee changes
  useEffect(() => {
    if (open) {
      if (holiday) {
        // Edit mode - populate form with formatted dates
        setFormData({
          start_date: formatDateForInput(holiday.start_date),
          end_date: formatDateForInput(holiday.end_date),
          description: holiday.description,
        });
      } else {
        // Add mode - reset form
        setFormData({
          start_date: '',
          end_date: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [open, holiday]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    // Validate that start_date <= end_date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate > endDate) {
        newErrors.end_date = 'End date must be greater than or equal to start date';
      }
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && holiday) {
        const updateData: UpdateHolidayRequest = {
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
        };

        const response = await holidayApi.update(holiday.company_custom_holiday_id, updateData);

        if (response.statusCode === 200) {
          onSuccess();
          onOpenChange(false);
        }
      } else {
        const createData: CreateHolidayRequest = {
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
        };

        const response = await holidayApi.create(createData);
        if (response.statusCode === 201) {
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      console.error('Failed to save holiday:', error);
      
      const newErrors: Record<string, string> = {};
      
      // Check if it's a validation error with detailed field errors
      if (error.response?.data?.errors?.validationErrors) {
        const validationErrors = error.response.data.errors.validationErrors;
        
        validationErrors.forEach((err: { field: string; messages: string[] }) => {
          newErrors[err.field] = err.messages.join(', ');
        });
        
        setErrors(newErrors);
        // Don't show submit error if we have field-specific errors
        if (Object.keys(newErrors).length === 0) {
          setErrors({ submit: 'Please fix the validation errors above' });
        }
      } 
      // Check if it's a regular error with a message
      else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } 
      // Fallback to generic error
      else {
        const errorMessage = error.message || 'Failed to save holiday';
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update holiday information.'
              : 'Fill in the details to create a new holiday.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Start Date & End Date Can be range or no */}
          <div>
            <Label htmlFor="start_date">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              disabled={isLoading}
              className="mt-1"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>
          <div>
            <Label htmlFor="end_date">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              disabled={isLoading}
              className="mt-1"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              End date must be greater than or equal to start date
            </p>
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Christmas Day, Company Anniversary"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              className="mt-1"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>


          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update Holiday' : 'Create Holiday'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
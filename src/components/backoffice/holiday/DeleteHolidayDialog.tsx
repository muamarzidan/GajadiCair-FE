import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { holidayApi, type Holiday } from '@/services/holiday';

interface DeleteHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
  onSuccess: () => void;
}

export const DeleteHolidayDialog = ({
  open,
  onOpenChange,
  holiday,
  onSuccess,
}: DeleteHolidayDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!holiday) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await holidayApi.delete(holiday.company_custom_holiday_id);

      if (response.statusCode === 200) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Failed to delete holiday:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete employee';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete Holiday</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete this holiday:{' '}
            <span className="font-semibold text-foreground">{holiday?.description}</span>?
            <br />
            <br />
            This action will soft delete the holiday from the system. The holiday will no longer
            be available.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Holiday
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Admin } from '@/pages/admin/AdminManagementPage';
import { InputPassword } from "@/components/ui/input-password.tsx";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: Admin;
  onSave: (adminId: string, password: string) => void;
  isSaving: boolean;
}

export function ChangePasswordDialog({
                                       open,
                                       onOpenChange,
                                       admin,
                                       onSave,
                                       isSaving,
                                     }: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    if (admin) {
      onSave(admin.id, password);
    }
  };

  // Reset state when the dialog is closed
  useEffect(() => {
    if (!open) {
      setPassword('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {admin?.name}. They will not be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              New Password
            </Label>
            <InputPassword
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="col-span-4 text-sm text-red-500 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

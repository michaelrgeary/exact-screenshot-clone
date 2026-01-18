import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings, useUpdateSettings, useResetPassword } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();
  const resetPassword = useResetPassword();

  const [formState, setFormState] = useState({
    default_processing_mode: 'supervised',
    quality_threshold: 0.80,
    email_notifications: true,
    notify_on_error: true,
    notify_on_phase_complete: false,
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState({
        default_processing_mode: settings.default_processing_mode || 'supervised',
        quality_threshold: settings.quality_threshold || 0.80,
        email_notifications: settings.email_notifications ?? true,
        notify_on_error: settings.notify_on_error ?? true,
        notify_on_phase_complete: settings.notify_on_phase_complete ?? false,
      });
    }
  }, [settings]);

  const handleFieldChange = <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync(formState);
    setHasChanges(false);
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      await resetPassword.mutateAsync(user.email);
      setIsPasswordModalOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.info('Please contact support to delete your account');
    setIsDeleteModalOpen(false);
    setDeleteConfirmText('');
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email} (cannot be changed)</p>
          </div>

          <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </Button>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="processing_mode">Default Processing Mode</Label>
            <Select
              value={formState.default_processing_mode}
              onValueChange={(value) => handleFieldChange('default_processing_mode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="supervised">Supervised</SelectItem>
                <SelectItem value="autonomous">Autonomous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality_threshold">Quality Threshold</Label>
            <Input
              id="quality_threshold"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={formState.quality_threshold}
              onChange={(e) => handleFieldChange('quality_threshold', parseFloat(e.target.value))}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Chapters must score above this to pass
            </p>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your projects
              </p>
            </div>
            <Switch
              checked={formState.email_notifications}
              onCheckedChange={(checked) => handleFieldChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify on Errors</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when processing encounters errors
              </p>
            </div>
            <Switch
              checked={formState.notify_on_error}
              onCheckedChange={(checked) => handleFieldChange('notify_on_error', checked)}
              disabled={!formState.email_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify on Phase Complete</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when each phase completes
              </p>
            </div>
            <Switch
              checked={formState.notify_on_phase_complete}
              onCheckedChange={(checked) => handleFieldChange('notify_on_phase_complete', checked)}
              disabled={!formState.email_notifications}
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || updateSettings.isPending}>
          {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <Separator />

        <div className="space-y-2">
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            Delete Account
          </Button>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account and all data
          </p>
        </div>
      </section>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              We'll send a password reset link to your email:
              <br />
              <strong>{user?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetPassword.isPending}>
              {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your account and all
                associated data including:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>All projects</li>
                <li>All chapters and content</li>
                <li>All glossary terms</li>
                <li>All output files</li>
              </ul>
              <div className="space-y-2 pt-2">
                <Label>Type "DELETE" to confirm:</Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

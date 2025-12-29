import { useState } from 'react';
import { Camera, Lock, User as UserIcon, Check, X } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { companyProfileApi, employeeProfileApi } from '@/services/profile';
// import { getImageUrl } from '@/utils';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfilePage = () => {
  const getImageUrl = (avatarUri: string | null): string | undefined => {
    if (!avatarUri) return undefined;
    const baseUrl = import.meta.env.VITE_STORAGE_BASE_URL;
    return `${baseUrl}/${avatarUri}`;
  };
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format file tidak valid. Hanya JPG dan PNG yang diperbolehkan.');
        e.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        e.target.value = '';
        return;
      }

      setError('');
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      const data = {
        name,
        profile_picture: profilePicture || undefined,
      };

      if (userRole === 'company') {
        const response = await companyProfileApi.updateProfile(data);
        if (response.statusCode === 200) {
          setSuccess('Profile berhasil diupdate!');
          setProfilePicture(null);
          setProfilePreview(null);
          // Reload page to update user context
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error(response.message || 'Gagal update profile');
        }
      } else if (userRole === 'employee') {
        const response = await employeeProfileApi.updateProfile(data);
        if (response.statusCode === 200) {
          setSuccess('Profile berhasil diupdate!');
          setProfilePicture(null);
          setProfilePreview(null);
          // Reload page to update user context
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error(response.message || 'Gagal update profile');
        }
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      
      const newFieldErrors: Record<string, string> = {};
      
      // Check if it's a validation error with detailed field errors
      if (err.response?.data?.errors?.validationErrors) {
        const validationErrors = err.response.data.errors.validationErrors;
        
        validationErrors.forEach((error: { field: string; messages: string[] }) => {
          newFieldErrors[error.field] = error.messages.join(', ');
        });
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the validation errors in the form');
      } 
      // Check if it's a regular error with a message
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } 
      // Fallback to generic error
      else {
        const errorMessage = err.message || 'Terjadi kesalahan saat update profile';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const data = {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      if (userRole === 'company') {
        const response = await companyProfileApi.changePassword(data);
        if (response.statusCode === 200) {
          setSuccess('Password successfully changed!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          throw new Error(response.message || 'Failed to change password');
        }
      } else if (userRole === 'employee') {
        const response = await employeeProfileApi.changePassword(data);
        if (response.statusCode === 200) {
          setSuccess('Password successfully changed!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          throw new Error(response.message || 'Failed to change password');
        }
      }
    } catch (err: any) {
      console.error('Failed to change password:', err);
      
      const newFieldErrors: Record<string, string> = {};
      
      // Check if it's a validation error with detailed field errors
      if (err.response?.data?.errors?.validationErrors) {
        const validationErrors = err.response.data.errors.validationErrors;
        
        validationErrors.forEach((error: { field: string; messages: string[] }) => {
          newFieldErrors[error.field] = error.messages.join(', ');
        });
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the validation errors in the form');
      } 
      // Check if it's a regular error with a message
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } 
      // Fallback to generic error
      else {
        const errorMessage = err.message || 'An error occurred while changing the password';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile information and account security
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Update Profile Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Update Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profilePreview || getImageUrl(user?.avatar_uri || null)} 
                        alt={user?.name} 
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Name Input */}
                  {
                    user?.role === 'company' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Type your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        {fieldErrors.name && (
                          <p className="text-sm text-red-500">{fieldErrors.name}</p>
                        )}
                      </div>
                    )
                  }
                  {/* Profile Picture Input */}
                  <div className="space-y-2">
                    <Label htmlFor="profile_picture">Profile Picture</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profile_picture"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleProfilePictureChange}
                        className="cursor-pointer"
                      />
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {fieldErrors.profile_picture && (
                      <p className="text-sm text-red-500">{fieldErrors.profile_picture}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Format: JPG, PNG. Max 5MB
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Old Password */}
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Old Password</Label>
                    <Input
                      id="old_password"
                      type="password"
                      placeholder="Type old password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    {fieldErrors.old_password && (
                      <p className="text-sm text-red-500">{fieldErrors.old_password}</p>
                    )}
                  </div>
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Type new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    {fieldErrors.new_password && (
                      <p className="text-sm text-red-500">{fieldErrors.new_password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Minimal 6 karakter
                    </p>
                  </div>
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    {fieldErrors.confirm_password && (
                      <p className="text-sm text-red-500">{fieldErrors.confirm_password}</p>
                    )}
                  </div>
                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading} variant="outline">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProfilePage;

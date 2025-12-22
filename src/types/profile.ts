export interface UpdateProfileRequest {
  name: string;
  profile_picture?: File;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileResponse {
  name: string;
  avatar_uri: string | null;
}

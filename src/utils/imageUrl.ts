export const getImageUrl = (avatarUri: string | null): string | undefined => {
  if (!avatarUri) return undefined;
  const baseUrl = import.meta.env.VITE_STORAGE_BASE_URL;
  return `${baseUrl}/${avatarUri}`;
};

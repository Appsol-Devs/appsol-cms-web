export const PROFILE_PHOTO_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function validateProfilePhotoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file (JPG, PNG, WEBP, or GIF).";
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Image must be smaller than 5 MB.";
  }

  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

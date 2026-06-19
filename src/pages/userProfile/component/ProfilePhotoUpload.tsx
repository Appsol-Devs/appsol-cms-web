import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showToast } from "@/components/ui/CustomToast";
import { getInitials } from "@/lib/helpers";
import {
  PROFILE_PHOTO_ACCEPT,
  validateProfilePhotoFile,
} from "@/lib/upload";
import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProfilePhotoUploadProps {
  imageUrl?: string;
  firstName?: string;
  lastName?: string;
  disabled?: boolean;
  onPhotoFileChange: (file: File | null) => void;
  onImageUrlChange: (imageUrl: string) => void;
}

const ProfilePhotoUpload = ({
  imageUrl,
  firstName,
  lastName,
  disabled,
  onPhotoFileChange,
  onImageUrlChange,
}: ProfilePhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewSrc = localPreviewUrl || imageUrl || undefined;

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      showToast({
        title: "Invalid image",
        message: validationError,
        type: "info",
        duration: 3000,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    onPhotoFileChange(file);
  };

  const handleRemovePhoto = () => {
    setLocalPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    onPhotoFileChange(null);
    onImageUrlChange("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Avatar className="w-24 h-24 border-4 border-muted shadow-sm">
        <AvatarImage
          src={previewSrc}
          alt={`${firstName ?? ""} ${lastName ?? ""}`}
          className="object-cover"
        />
        <AvatarFallback className="text-2xl font-bold">
          {getInitials(firstName, lastName) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <input
          ref={inputRef}
          type="file"
          accept={PROFILE_PHOTO_ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={handleSelectFile}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="gap-2 bg-primary! text-primary-foreground!"
          >
            <ImagePlus className="h-4 w-4" />
            <span className="text-xs">Choose photo</span>
          </Button>

          {(imageUrl || localPreviewUrl) && (
            <Button
              variant="destructive"
              size="sm"
              disabled={disabled}
              onClick={handleRemovePhoto}
              className="bg-red-700! text-white hover:bg-red-800"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Remove</span>
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WEBP, or GIF. Max 5 MB. Saved when you update your profile.
        </p>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;

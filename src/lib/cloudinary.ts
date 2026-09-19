export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log("=== CLOUDINARY DEBUG ===");
  console.log("Cloud Name:", cloudName);
  console.log("Upload Preset:", uploadPreset);
  console.log("File Name:", file.name);
  console.log("File Type:", file.type);
  console.log("File Size:", file.size);

  if (!cloudName) {
    throw new Error(
      "Cloudinary Cloud Name tidak ditemukan."
    );
  }

  if (!uploadPreset) {
    throw new Error(
      "Cloudinary Upload Preset tidak ditemukan."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log("Upload URL:", uploadUrl);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log("=== CLOUDINARY RESPONSE ===");
  console.log("Status:", response.status);
  console.log("Response:", data);

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `Cloudinary error: ${response.status}`
    );
  }

  if (!data.secure_url) {
    throw new Error(
      "Cloudinary tidak memberikan URL gambar."
    );
  }

  console.log("Upload berhasil:", data.secure_url);

  return data.secure_url;
}
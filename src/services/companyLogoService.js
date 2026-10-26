const MAX_COMPANY_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_COMPANY_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const ALLOWED_COMPANY_LOGO_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export function validateCompanyLogoFile(file) {
  if (!file) return 'Choose an image to upload.';
  if (file.size > MAX_COMPANY_LOGO_BYTES) return 'Choose an image that is 2 MB or smaller.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_COMPANY_LOGO_EXTENSIONS.has(extension)
    || (file.type && !ALLOWED_COMPANY_LOGO_TYPES.has(file.type))) {
    return 'Choose a PNG, JPG, JPEG, or WebP image.';
  }
  return '';
}

export function readCompanyLogoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('The selected image could not be read. Choose another file.'));
    };
    reader.onerror = () => reject(new Error('The selected image could not be read. Choose another file.'));
    reader.readAsDataURL(file);
  });
}

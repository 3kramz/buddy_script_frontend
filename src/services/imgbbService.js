/**
 * Uploads an image File to ImgBB directly from the browser.
 * Returns the permanent CDN URL on success.
 * @param {File} file - The image file from an <input type="file">
 * @returns {Promise<string>} - The direct ImgBB image URL
 */
export const uploadImageToImgBB = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error('VITE_IMGBB_API_KEY is not set in .env');

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', file);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`ImgBB upload failed: ${data.error?.message || 'Unknown error'}`);
  }

  return data.data.url; // e.g. "https://i.ibb.co/xxxx/photo.png"
};

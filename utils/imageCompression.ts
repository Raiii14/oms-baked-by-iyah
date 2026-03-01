
/**
 * Compresses an image file using the browser's Canvas API.
 * 
 * @param file - The original File object.
 * @param quality - The quality of the output image (0.0 to 1.0). Default is 0.7.
 * @param maxWidth - The maximum width of the output image. Default is 1024px.
 * @returns A Promise that resolves to the compressed File object.
 */
export const compressImage = async (
  file: File, 
  quality: number = 0.7, 
  maxWidth: number = 1024
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            // Create a new File object with the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Force JPEG for better compression
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

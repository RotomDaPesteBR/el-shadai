import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true,
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export async function uploadImageToCloudinary(imageBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fit', background: 'white' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary upload failed: No secure_url returned.'));
        }
      }
    ).end(imageBuffer);
  });
}
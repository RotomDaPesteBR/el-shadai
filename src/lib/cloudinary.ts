import { v2 } from 'cloudinary';

const cloudinary = () => {
  v2.config({ secure: true });
  return v2;
};

export default cloudinary;

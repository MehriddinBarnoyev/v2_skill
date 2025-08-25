import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'skill_exchange',
    api_key: process.env.CLOUDINARY_API_KEY || '367676411854659',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'qm1JmXS8QVN6DeKmIicPJ0hKTdE',
  });
};
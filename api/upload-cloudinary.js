// api/upload-cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// Configura Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    // Obtener la imagen del body (enviada como base64 o multipart)
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen' });
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'localstore',
      public_id: `img_${Date.now()}`,
    });

    // Devolver la URL segura
    res.status(200).json({ 
      success: true, 
      link: result.secure_url 
    });
    
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al subir la imagen' 
    });
  }
}

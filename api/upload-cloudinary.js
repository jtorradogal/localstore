// api/upload-cloudinary.js
export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    // 1. Obtener la imagen en base64 del body
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen' });
    }

    // 2. Extraer solo la parte de datos base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    // 3. Configuración (usa tus variables de entorno)
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = 'localstore_unsigned'; // Asegúrate de haber creado este preset

    // 4. Preparar FormData para Cloudinary
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 5. Subir a Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const cloudinaryResult = await cloudinaryResponse.json();

    // 6. Devolver respuesta
    if (cloudinaryResult.secure_url) {
      return res.status(200).json({ 
        success: true, 
        link: cloudinaryResult.secure_url 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: cloudinaryResult.error?.message || 'Error subiendo a Cloudinary' 
      });
    }
    
  } catch (error) {
    console.error('Error en la función:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error interno' 
    });
  }
}

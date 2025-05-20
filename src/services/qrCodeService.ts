
// In a real application, this would use a library like qrcode
// For this demo, we'll mock QR code generation

interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a QR code image URL from text content
 */
export const generateQRCode = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  // In a real application, we would use a proper QR code library
  // For this demo, we'll return a placeholder image URL
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, we would generate a QR code and return a data URL
  // For demo purposes, we're returning a placeholder image
  return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(text);
};

/**
 * Save QR code as an image file
 */
export const saveQRCodeAsImage = async (dataUrl: string, filename: string): Promise<void> => {
  // Create a link element
  const link = document.createElement('a');
  
  // Set link properties
  link.href = dataUrl;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  generateQRCode,
  saveQRCodeAsImage
};

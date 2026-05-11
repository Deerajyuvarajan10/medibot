export async function generateMedicalImage(prompt) {
  const medicalEnhancement = 'medical illustration, anatomically accurate, educational, professional, clean white background, high quality diagram';
  const enhancedPrompt = `${prompt}, ${medicalEnhancement}`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;
  
  // Verify image loads
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error('Image generation failed'));
    img.src = imageUrl;
  });
}

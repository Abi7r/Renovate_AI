const axios = require("axios");
const stabilityUrl = "https://api.stability.ai/v1/generation";
const FormData = require("form-data");
const sharp = require("sharp");

const redesignRoom = async (userPrompt, style, roomType, imageBuffer) => {
  try {
    const resizedImage = await sharp(imageBuffer)
      .resize(1152, 896, { fit: "cover" })
      .jpeg()
      .toBuffer();
    const enhancedPrompt = `Redesign this ${roomType} in ${style} style . ${userPrompt} ,detailed textures proffessional interior design,architectural,high quality photography,photorealistic , 8k ,interior photography,architectural digest,beautiful lighting,high detail`;
    console.log("Generating prompts with prompt->", enhancedPrompt);
    const formData = new FormData();
    formData.append("init_image", resizedImage, {
      filename: "room.jpg",
      contentType: "image/jpeg",
    });
    formData.append("init_image_mode", "IMAGE_STRENGTH");
    formData.append("image_strength", "0.65");
    formData.append("text_prompts[0][text]", enhancedPrompt);
    formData.append("text_prompts[0][weight]", "1");
    formData.append(
      "text_prompts[1][text]",
      "blurry",
      "lowquality",
      "distorted",
      "deformed",
      "unnatural",
      "amateur"
    );
    formData.append("text_prompts[1][weight]", -1);
    formData.append("cfg_scale", "7");
    formData.append("samples", "3");
    formData.append("steps", "30");
    const response = await axios.post(
      `${stabilityUrl}/stable-diffusion-xl-1024-v1-0/image-to-image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    // const images = response.data.artifacts.map((artifact, index) => ({
    //   url: `data:image/png;base64,${artifact.base64}`,
    //   id: `redesign-${Date.now()}-${index}`,
    // }));
    const images = response.data.artifacts.map(
      (artifact) => `data:image/png;base64,${artifact.base64}`
    );
    console.log("Image generation complete", images);
    return images;
  } catch (error) {
    console.log("Error occured in redesign room function", error);
    throw new Error(error.response?.data?.message || "Failed to redesign room");
  }
};

const generateImages = async (userPrompt, style, roomType) => {
  try {
    const enhancedPompt = `Interior design photography of a ${style} style ${roomType},${userPrompt},photorealistic , 8k ,interior photography,architectural digest,beautiful lighting,high detail`;
    console.log("Generating prompts with prompt->", enhancedPompt);
    const response = await axios.post(
      `${stabilityUrl}/stable-diffusion-xl-1024-v1-0/text-to-image`,
      {
        text_prompts: [
          { text: enhancedPompt, weight: 1 },
          {
            text: "blurry ,lowquality,ugly,unrealistic,abstract,amateur,distorted,poorly drawn,lowres,watermarked,anime,",
            weight: -1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 2,
        steps: 30,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const images = response.data.artifacts.map((artifact, index) => ({
      url: `data:image/png;base64,${artifact.base64}`,
      id: `stability-${Date.now()}-${index}`,
    }));
    console.log("Image generation complete", images);
    return images;
  } catch (error) {
    console.log("Error occured in generate images function", error);
    throw new Error(
      error.response?.data?.message || "Failed to generate images"
    );
  }
};
module.exports = {
  generateImages,
  redesignRoom,
};

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const sharp = require("sharp");
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const redesignRoom = async (roomType, style, userPrompt, imageBuffer) => {
  try {
    const resizedImage = await sharp(imageBuffer)
      .resize(1024, 1024, {
        fit: "inside",
      })
      .jpeg({ quality: 95 })
      .toBuffer();

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];

    const model = genAi.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      safetySettings,
    });
    const enhancedPrompt = `Redesign this ${roomType} interior in ${style} style. ${
      userPrompt || ""
    } 
    Make it photorealistic, professional interior design photography, high detail, beautiful lighting. 
    Preserve the room layout and structure as much as possible while applying the new style.`;
    const imagePart = {
      inlineData: {
        data: resizedImage.toString("base64"),
        mimeType: "image/jpeg",
      },
    };
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: enhancedPrompt }, imagePart] },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    const images = (result.response.candidates || []).flatMap((candidate) =>
      candidate.content.parts
        .filter((part) => !!part.inlineData)
        .map(
          (part) =>
            `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        )
    );
    if (images.length === 0) {
      throw new Error("No images generated");
    }
    console.log(`Generated ${images.length} redesigned images`);
    return images;
  } catch (error) {
    console.error("Error in Gemini redesign:", error);
    throw new Error(error.message || "Failed to redesign room with Gemini");
  }
};
module.exports = { redesignRoom };

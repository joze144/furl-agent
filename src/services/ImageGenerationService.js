import axios from "axios";

export class ImageGenerationService {
  constructor() {
    this.name = "ImageGenerationService";
    this.url = "https://api.openai.com/v1/images/generations";
    this.apiKey = process.env.OPEN_AI_API_KEY || "";
    this.imageUploadAuth = process.env.IMAGE_UPLOAD_JWT || "";
  }

  generateImage = async (prompt) => {
    const body = {
      model: "dall-e-3",
      prompt: "An image in vertical orientation, of a memory based on the following text: " + prompt,
      n: 1,
      size: "1024x1792"
    }

    const { data } = await axios.post(this.url, body, {
      headers: {
        'Content-Type': 'application/json',
        'accepts': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    console.log("Image generated:", data.data[0].url); // json object

    return this.uploadImage(data.data[0].url);
  }

  uploadImage = async (imageUrl) => {
    const { data } = await axios.post('https://filestore-api.getselect.co/api/v1/upload/url', { source_url: imageUrl }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.imageUploadAuth,
      }
    });

    console.log("Image upload response: ", data);

    return data.data.url;
  }
}

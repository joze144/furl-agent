import { loadTools } from "./tools/index.js";
import { loadServices } from "./services/index.js";

export class Agent {
  constructor() {
    this.tools = [];
    this.services = [];
    this.tempConversations = {};
    this.initialized = false;
  }

  /**
   * Initialize the agent service
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log("Initializing agent service...");

    // Initialize tools
    this.tools = await loadTools();

    // Initialize services
    this.services = await loadServices(this);

    console.log("Agent initialized...");
    this.initialized = true;
  }

  /**
   * Process a user message and return the agent's response
   */
  async processMessage(message, conversationId) {
    // Ensure the agent is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`Processing conversation: ${conversationId}`);

    if (conversationId === "temp") {
      this.tempConversations[conversationId] = this.createNewConversation();
    }

    // Add user message
    this.tempConversations[conversationId].push({
      role: "user",
      content: message,
    });

    // Beautify message
    console.log("Beautifying message...");
    const beutifiedResponse = message;

    // Generate image from the message
    console.log(this.services)
    console.log(this.tools)

    const imageService = this.services.find((service) => service.name === "ImageGenerationService")
    const imageUrl = await imageService.generateImage(beutifiedResponse);

    // Upload metadata to IPFS
    console.log("Uploading metadata to IPFS...");
    const ipfsService = this.services.find((service) => service.name === "IPFSService")
    const metadata = ipfsService.createNFTMetadata('Crypto Note Entry', beutifiedResponse, imageUrl);
    console.log("Metadata: ", metadata);
    const metadataUrl = await ipfsService.uploadMetadata(metadata);

    console.log("Metadata URL: ", metadataUrl);

    // Mint NFT in users wallet
    console.log("Minting NFT in users wallet...");
    const mintService = this.services.find((service) => service.name === "MintToken")
    const tx = await mintService.mintToken(metadataUrl);
 
    console.log(`🤖 Assistant (initial): ${beutifiedResponse}`);
    console.log("Agent response ended");

    let finalResponse = {
        txHash: tx,
        imageUrl: imageUrl,
        message: beutifiedResponse
    };

    return {
      conversationId: conversationId,
      response: finalResponse,
    };
  }

  /**
   * Call the Nilai API
   */
  async callNilaiAPI(messages) {
    // Using this to satisfy class-methods-use-this rule
    if (!this.initialized) {
      console.log("Warning: API call before full initialization");
    }

    const apiUrl = process.env.NILAI_API_URL;
    const apiKey = process.env.NILAI_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error(
        "Missing NILAI_API_URL or NILAI_API_KEY environment variables"
      );
    }

    try {
      console.log("Calling Nilai API...");
      const response = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct",
          messages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Nilai API:", error);
      throw error;
    }
  }

  /**
   * Create a new conversation with system message
   */
  createNewConversation() {
    // Create tool information with descriptions and examples
    let toolInfo = "";

    // Use map and join instead of for...of
    toolInfo = this.tools
      .map((tool) => {
        const toolDescription = `## ${tool.name}\n${tool.description}\n\nExamples:\n`;

        // Use map and join for examples too
        const exampleText = tool.examples
          .map(
            (example) => `
User: "${example.userQuery}"
Tool with input: <tool>${tool.name}: ${example.toolInput}</tool>
Expected Tool Output Response Format: ${example.toolOutput}
`
          )
          .join("");

        return `${toolDescription + exampleText}\n\n`;
      })
      .join("");

    return [
      {
        role: "system",
        content: `You are a helpful assistant with access to tools. Follow these steps:
1. If a user's request requires current data or information you don't have, use an available tool.
2. To use a tool, respond with: <tool>tool_name: tool_input</tool>
3. After receiving tool results, provide a helpful response incorporating the information.
4. After executing a tool or if a tool fails, just provide the response. DO NOT suggest any other tools.
5. If a user's request is not clear, ask for more information.

# Available Tools and Usage Examples
${toolInfo}

Always use tools when appropriate rather than making up information. Study the examples carefully to understand when and how to use each tool.`,
      },
    ];
  }

  /**
   * Convert local format to Nillion format for storage
   */
  convertToNillionFormat(conversationId) {
    const messages = this.tempConversations[conversationId];
    const currentTime = new Date().toISOString();

    // Convert messages to Nillion format
    const encryptedMessages = messages.map((message, index) => {
      // Calculate a reasonable timestamp with 30 second intervals between messages
      const timestamp = new Date(
        Date.now() - (messages.length - index) * 30000
      ).toISOString();

      return {
        role: message.role,
        content: {
          "%allot": message.content,
        },
        timestamp,
      };
    });

    return {
      user_id: this.user_id,
      created_at: encryptedMessages[0].timestamp,
      updated_at: currentTime,
      messages: encryptedMessages,
    };
  }
}

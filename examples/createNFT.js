import { createAndMintNFT } from '../src/utils/createAndMintNFT.js';
import fs from 'fs';
import path from 'path';

// Example usage with an already existing image URL
async function createNFTWithUrl() {
  try {
    const nftData = {
      name: "My Awesome NFT",
      description: "This is a description of my awesome NFT created with IPFS using Pinata",
      // Using an example image URL - replace with your actual image URL
      image: "https://example.com/my-image.png",
      attributes: [
        { trait_type: "Background", value: "Blue" },
        { trait_type: "Eyes", value: "Green" },
        { trait_type: "Species", value: "Alien" }
      ]
    };
    
    console.log("Creating and minting NFT with URL image");
    
    const result = await createAndMintNFT(nftData);
    
    console.log("✅ NFT created and minted successfully!");
    console.log("IPFS URL:", result.metadataUrl);
    console.log("Transaction Hash:", result.transactionReceipt.hash);
  } catch (error) {
    console.error("❌ Error in NFT creation example:", error);
  }
}

// Example usage with a file from disk
async function createNFTWithFile() {
  try {
    // Path to your image file - replace with your actual image path
    const imagePath = path.join(process.cwd(), 'examples', 'sample-image.png');
    
    // Read image file as buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    const nftData = {
      name: "File-based NFT",
      description: "This NFT was created by uploading a file directly to IPFS using Pinata",
      // Pass the image buffer
      image: imageBuffer,
      attributes: [
        { trait_type: "Type", value: "File Upload" },
        { trait_type: "Created", value: new Date().toISOString().split('T')[0] }
      ]
    };
    
    console.log("Creating and minting NFT with file image");
    
    const result = await createAndMintNFT(nftData);
    
    console.log("✅ NFT created and minted successfully!");
    console.log("IPFS URL:", result.metadataUrl);
    console.log("Transaction Hash:", result.transactionReceipt.hash);
  } catch (error) {
    console.error("❌ Error in NFT file upload example:", error);
  }
}

// Run the examples
console.log("=== URL-based Example ===");
await createNFTWithUrl();

console.log("\n=== File-based Example ===");
await createNFTWithFile(); 
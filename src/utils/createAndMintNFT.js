import { IPFSService } from '../services/IPFSService.js';
import { MintTokenService } from '../services/MintToken.js';

/**
 * Example function to create NFT metadata, upload to IPFS, and mint the token
 * @param {Object} nftData - NFT data
 * @param {string} nftData.name - Name of the NFT
 * @param {string} nftData.description - Description of the NFT
 * @param {string|Buffer|ReadableStream} nftData.image - Image URL, IPFS URI, or image data
 * @param {Array} nftData.attributes - Attributes for the NFT
 */
export async function createAndMintNFT(nftData) {
  try {
    // Initialize services
    const ipfsService = new IPFSService();
    const mintService = new MintTokenService();
    
    let ipfsUrl;
    
    // Check if image is a Buffer or ReadableStream (for upload)
    const isImageData = Buffer.isBuffer(nftData.image) || 
                        (typeof nftData.image === 'object' && nftData.image !== null);
    
    if (isImageData) {
      console.log("Uploading image and creating metadata...");
      ipfsUrl = await ipfsService.uploadNFTWithImage(
        nftData.image,
        nftData.name,
        nftData.description,
        nftData.attributes || []
      );
    } else {
      // If image is already a URL, just create and upload metadata
      console.log("Creating and uploading metadata with existing image URL...");
      const metadata = ipfsService.createNFTMetadata(
        nftData.name,
        nftData.description,
        nftData.image,
        nftData.attributes || []
      );
      ipfsUrl = await ipfsService.uploadMetadata(metadata);
    }
    
    console.log("NFT metadata IPFS URL:", ipfsUrl);
    
    // Mint the token with the IPFS URL
    console.log("Minting NFT with IPFS URL...");
    const txReceipt = await mintService.mintToken(ipfsUrl);
    
    console.log("NFT minted successfully!");
    console.log("Transaction receipt:", txReceipt);
    
    return {
      metadataUrl: ipfsUrl,
      transactionReceipt: txReceipt
    };
    
  } catch (error) {
    console.error("Error creating and minting NFT:", error);
    throw error;
  }
} 
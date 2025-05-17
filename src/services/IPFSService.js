import { v4 as uuidv4 } from 'uuid';

export class IPFSService {
    constructor() {
        this.name = "IPFSService";
        this.auth = process.env.PINATA_API_JWT || "";
        console.log("Pinata SDK initialized");
    }

    /**
     * Create NFT metadata JSON
     * @param {string} name - Name of the NFT
     * @param {string} description - Description of the NFT
     * @param {string} image - Image URL or IPFS URI
     * @param {Array} attributes - Additional attributes for the NFT
     * @returns {Object} - NFT metadata object
     */
    createNFTMetadata = (name, description, image, attributes = []) => {
        return {
            name,
            description,
            image,
            attributes,
            created_at: new Date().toISOString()
        };
    }

    /**
     * Upload JSON metadata to IPFS using Pinata
     * @param {Object} metadata - NFT metadata object
     * @returns {string} - IPFS URL of the uploaded metadata
     */
    uploadMetadata = async (metadata) => {
        try {
            const form = new FormData();
            form.append("network", "public");
            form.append("name", uuidv4());
            form.append("group_id", "9bd8b656-f4b5-4056-993c-3720b0aaa20f");
            form.append("keyvalues", "{}");
            
            // For JSON metadata, we need to create a Blob and append it
            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
            form.append('file', metadataBlob, 'metadata.json');

            const options = {
                method: 'POST',
                // Don't set Content-Type header, fetch will set it automatically with boundary
                headers: {Authorization: `Bearer ${this.auth}`},
                body: form
            };

            const response = await fetch('https://uploads.pinata.cloud/v3/files', options);
            const resp = await response.json();
            console.log("Response: ", resp);


            return `https://plum-charming-flea-750.mypinata.cloud/ipfs/${resp.data.cid}`;
        } catch (error) {
            console.error("Error uploading metadata to IPFS:", error);
            throw error;
        }
    }

    /**
     * Upload image to IPFS and create metadata with the image URL
     * @param {Buffer|Blob} imageData - Image data to upload
     * @param {string} name - Name of the NFT
     * @param {string} description - Description of the NFT
     * @param {Array} attributes - Additional attributes for the NFT
     * @returns {string} - IPFS URL of the uploaded metadata
     */
    uploadNFTWithImage = async (imageData, name, description, attributes = []) => {
        try {
            // Upload image to Pinata
            console.log("Uploading image to Pinata");
            
            const form = new FormData();
            form.append("network", "public");
            form.append("name", `${name}-image`);
            form.append("group_id", "9bd8b656-f4b5-4056-993c-3720b0aaa20f");
            form.append("keyvalues", "{}");
            
            // Create a proper file from the imageData
            let imageFile;
            if (Buffer.isBuffer(imageData)) {
                // If imageData is a Buffer, convert it to a Blob
                imageFile = new Blob([imageData]);
            } else {
                // Use as is if it's already a Blob
                imageFile = imageData;
            }
            
            // Append the image file to the form
            form.append('file', imageFile, 'image.png');
            
            const options = {
                method: 'POST',
                headers: {Authorization: `Bearer ${this.auth}`},
                body: form
            };
            
            const imageResponse = await fetch('https://uploads.pinata.cloud/v3/files', options);
            const imageResp = await imageResponse.json();
            console.log("Image upload response:", imageResp);
            
            if (!imageResp || !imageResp.IpfsHash) {
                throw new Error("Failed to get image IPFS hash from Pinata");
            }
            
            // Create image IPFS URL
            const imageUrl = `ipfs://${imageResp.IpfsHash}`;
            console.log("Image uploaded to IPFS:", imageUrl);
            
            // Create metadata with image URL
            const metadata = this.createNFTMetadata(name, description, imageUrl, attributes);
            
            // Upload metadata to IPFS
            return await this.uploadMetadata(metadata);
        } catch (error) {
            console.error("Error uploading NFT with image:", error);
            throw error;
        }
    }
} 

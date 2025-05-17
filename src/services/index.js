import { ImageGenerationService } from "./ImageGenerationService.js";
import { MintTokenService } from "./MintToken.js";
import { IPFSService } from "./IPFSService.js";

/**
 * Load all available services
 */
export async function loadServices(agent) {
    const services = [
        ImageGenerationService,
        MintTokenService,
        IPFSService,
    ];

    const results = await Promise.all(
        services.map(async (Service) => {
            try {
                const service = new Service(agent);
                console.log({ service }) 
                if (service) {
                    console.log(`✅ ${service.name} service initialized`);
                    return service;
                }
                return null;
            } catch (error) {
                console.error("Failed to initialize service:", error);
                return null;
            }
        })
    );

    // Filter out any null results
    return results.filter((service) => service !== null);
}

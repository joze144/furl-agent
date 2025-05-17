import { initializeWeatherTool } from './weather.js';


/**
 * Load all available tools
 */
export async function loadTools() {
  const toolFactories = [
    initializeWeatherTool
  ];

  const results = await Promise.all(
    toolFactories.map(async (factory) => {
      try {
        const tool = await factory();
        if (tool) {
          console.log(`✅ ${tool.name} tool initialized`);
          return tool;
        }
        return null;
      } catch (error) {
        console.error("Failed to initialize tool:", error);
        return null;
      }
    })
  );

  // Filter out any null results
  return results.filter((tool) => tool !== null);
}

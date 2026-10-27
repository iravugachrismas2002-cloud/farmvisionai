import os

content = """import "server-only";

/**
 * FarmVision Authentication Configuration
 * 
 * Replaces Manus OAuth config with FarmVision-native authentication config.
 * Uses environment variables for JWT session management.
 */

// JWT secret for session signing - should be a strong random string
// Set via FARMVISION_JWT_SECRET in .env
function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Required server environment variable is missing: ${name}`);
  }
  return value;
}

// Configuration for FarmVision session management
export interface FarmVisionAuthConfig {
  jwtSecret: string;
}

/**
 * Gets the FarmVision authentication configuration from environment variables.
 * Replaces the removed getManusOAuthConfig() function.
 */
export function getFarmVisionAuthConfig(): FarmVisionAuthConfig {
  return {
    jwtSecret: requiredEnvironmentVariable("FARMVISION_JWT_SECRET"),
  };
}
"""

with open('C:\\Users\\user\\farmvisioncode\\backend\\src\\server\\auth\\config.ts', 'w') as f:
    f.write(content)
    
print("File written successfully")
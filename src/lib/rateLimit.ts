import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for API endpoints
export const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes if exceeded
});

// Rate limiter for authentication attempts
export const authLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

// Rate limiter for file uploads
export const uploadLimiter = new RateLimiterMemory({
  points: 10, // 10 uploads
  duration: 60 * 60, // Per hour
  blockDuration: 60 * 60 * 2, // Block for 2 hours if exceeded
});

// Rate limiter for analysis requests
export const analysisLimiter = new RateLimiterMemory({
  points: 20, // 20 analyses
  duration: 60 * 60, // Per hour
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

export async function checkRateLimit(limiter: RateLimiterMemory, key: string): Promise<boolean> {
  try {
    await limiter.consume(key);
    return true;
  } catch (error) {
    if (error.msBeforeNext) {
      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(error.msBeforeNext / 1000)} seconds.`);
    }
    throw error;
  }
}
// In-memory store to track requests
const rateLimitStore = {};

const RATE_LIMIT_WINDOW = 2 * 60 * 1000  // 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS =  5 // 100// Maximum number of requests per IP within the window

// Custom rate limiting middleware
const customRateLimiter = (req, res, next) => {
  const ip = req.ip; // Get the IP address of the client
  const currentTime = Date.now();

  // Initialize the record for the IP address if it doesn't exist
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      requests: 1, // Start with one request
      startTime: currentTime, // Track the start time of the window
    };
  } else {
    //Calculates how much time has passed since the first request in the current window.
    //Why? To determine if the current request is within the allowed time window.
    const timeDifference = currentTime - rateLimitStore[ip].startTime;

    // If the current time exceeds the time window, reset the counter and start time
    if (timeDifference > RATE_LIMIT_WINDOW) {
      rateLimitStore[ip] = {
        requests: 1,
        startTime: currentTime,
      };
    } else {
      // Increment the request count
      rateLimitStore[ip].requests += 1;

      console.log(rateLimitStore);

      // Check if the request count exceeds the maximum allowed requests
      if (rateLimitStore[ip].requests > MAX_REQUESTS) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.',
        });
      }
    }
  }

  next(); // Pass the request to the next middleware or route handler
};

module.exports = customRateLimiter;


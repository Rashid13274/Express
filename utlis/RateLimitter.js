const express = require('express');
const rateLimit = require('express-rate-limit');

/* 
==> windowMs: The time frame for which requests are checked/remembered (15 minutes).
==> max: The maximum number of requests allowed per windowMs (100 requests).
==> standardHeaders: Adds rate limit information to the RateLimit-* headers.
==> legacyHeaders: Disables the older X-RateLimit-* headers.
*/

// Create a rate limiter
const limitter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders:false, // Disable the ` X-RateLimit-*` headers
})

// Customizing the Rate Limiter (custom Error Message) : 
/* 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  });

*/
  

/* 
Dynamic Rate Limiting: You can define the max option dynamically based on request parameters,
like a user’s API key:

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: (req, res) => {
    if (req.user && req.user.isPremium) {
      return 1000; // Premium users get a higher limit
    } else {
      return 100; // Standard users get the default limit
    }
  }
});
*/
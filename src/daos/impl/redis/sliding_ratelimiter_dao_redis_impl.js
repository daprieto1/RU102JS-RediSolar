/* eslint-disable no-unused-vars */
const redis = require('./redis_client');
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');
const shortId = require('shortid');


// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();
  const transaction = client.multi();

  // START Challenge #7
  const ratelimiterKey = keyGenerator.getSlidingRateLimiterKey(name, opts.interval, opts.maxHits);
  const currentTimestamp = timeUtils.getCurrentTimestampMillis();
  const member = `${currentTimestamp}-${shortId.generate()}`;

  transaction.zaddAsync(ratelimiterKey, currentTimestamp, member);
  transaction.zremrangebyscoreAsync(ratelimiterKey, '-inf', currentTimestamp - (opts.interval * 1));
  transaction.zcardAsync(ratelimiterKey);

  const results = await transaction.execAsync();
  const hits = parseInt(results[2], 10);

  let hitsRemaining;

  if (hits > opts.maxHits)
    hitsRemaining = -1;
  else
    hitsRemaining = opts.maxHits - hits;

  return hitsRemaining;
  // END Challenge #7
};

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow,
};
/* eslint-enable */

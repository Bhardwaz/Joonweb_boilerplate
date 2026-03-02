// this is joonweb validation middleware - need to fetch from previous projects

const sendResponse = require("../utilities/sendResponse");

const checkValidation = async (req, res, next) => {
  const site = req.session.site;
  
  if (!site) {
    return sendResponse.error(res, "UNAUTHORIZED", "No active session found", 401);
  }

  const sessionManager = req.sessionManager;

  if (!sessionManager || typeof sessionManager.getAccessToken !== 'function') {
    return sendResponse.error(res, "INTERNAL_ERROR", "Session Manager not initialized", 500);
  }

  try {
    const accessToken = await sessionManager.getAccessToken(site);

    if (!accessToken) {
      return sendResponse.error(res, "UNAUTHORIZED", "Session invalid or expired", 401);
    }

    req.accessToken = accessToken;
    req.site = site;
    
    next();
  } catch (error) {
    return sendResponse.error(res, "AUTH_ERROR", error.message, 500);
  }
};

module.exports = checkValidation;
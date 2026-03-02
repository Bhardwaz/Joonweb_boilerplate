const path = require('path');
const { JoonWebAPI, Helper } = require('@joonweb/joonweb-sdk');
const verifyHmac = require("../helper/joonwebHelper");
const { sessionManager } = require("../config/joonweb"); 

const appHandshake = async (req, res) => {
  console.log("🔄 App Bridge Handshake Initiated...");
  let accessToken = '';

  if (req.query.session && req.query.id_token && req.query.site) {
    if (!verifyHmac(req.query)) {
      console.error("❌ HMAC Verification Failed");
      return res.status(401).send('Invalid HMAC signature');
    }

    const idToken = Helper.decodeSessionToken(req.query.id_token);
    if (idToken) {
      const tokenData = await sessionManager.getSessionData(req.query.site) || null;
      if (tokenData) {
        await sessionManager.startSession(req.query.site, tokenData);
        req.session.joonweb_session = req.query.session;
        req.session.site = req.query.site;
        req.session.joonweb_user = idToken.sub;
        req.session.save(); 
      } else {
        return res.status(401).send('Invalid Tokens - No Token Data found');
      }
    } else {
      return res.status(401).send('Expired Token');
    }
  }

  const site = req.query.site || req.session.site;

  if (!site || !(await sessionManager.isAuthenticated(site))) {
    console.log("⚠️ Not Authenticated, Redirecting to /auth...");
    return res.redirect(`/auth?site=${site}`);
  }

  try {
    accessToken = await sessionManager.getAccessToken(site);
    const api = new JoonWebAPI(accessToken, site);
    await api.site.get();

    // Adjusted path since we are inside /controllers now
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  } catch (err) {
    console.error("Error fetching site info:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getSiteInfo = async (req, res) => {
  const site = req.session.site;
  if (!site) return res.status(401).json({ error: "No session found" });

  try {
    const accessToken = await sessionManager.getAccessToken(site);
    const api = new JoonWebAPI(accessToken, site);
    const userInfo = req.session.joonweb_user;
    const siteInfo = await api.site.get();

    return res.json({ userInfo, site, siteInfo });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { appHandshake, getSiteInfo };
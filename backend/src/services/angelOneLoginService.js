import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const {
  ANGEL_LOGIN_URL,
  SMARTAPI_KEY,
  CLIENT_CODE,
  TRADING_PIN,
  TOTP_SECRET,
} = process.env;

// Simple TOTP implementation
function generateTotp(secret) {
  // Basic TOTP implementation (simplified)
  const time = Math.floor(Date.now() / 1000 / 30);
  
  // Convert secret to base32 if needed (simplified)
  const key = Buffer.from(secret, 'base64');
  
  // Create HMAC counter
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(time), 0);
  
  // Generate HMAC
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counter);
  const digest = hmac.digest();
  
  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

// Angel One Login Function
export async function loginToAngelOne(manualTotp = null) {
  try {
    if (!TRADING_PIN || TRADING_PIN === 'your_trading_pin_here') {
      throw new Error('TRADING_PIN not configured in .env file');
    }

    let totp;
    if (manualTotp) {
      totp = manualTotp;
      console.log("🔐 Using manually provided TOTP");
    } else if (TOTP_SECRET && TOTP_SECRET !== 'your_totp_secret_here') {
      totp = generateTotp(TOTP_SECRET);
    } else {
      throw new Error('TOTP_SECRET not configured and no manual TOTP provided');
    }
    const body = {
      clientcode: CLIENT_CODE,
      password: TRADING_PIN,
      totp,
    };

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "127.0.0.1",
      "X-ClientPublicIP": "127.0.0.1",
      "X-MACAddress": "00:00:00:00:00:00",
      "X-PrivateKey": SMARTAPI_KEY,
    };

    console.log("🔐 Attempting Angel One login...");
    const res = await axios.post(ANGEL_LOGIN_URL, body, { headers });

    if (res.data?.status === true) {
      const data = res.data?.data ?? {};
      const feedToken = data?.feedToken;
      const jwtToken = data?.jwtToken;

      if (!feedToken || !jwtToken) {
        console.error("❌ Missing feedToken or jwtToken in login response.");
        console.log("Full response:", JSON.stringify(res.data, null, 2));
        throw new Error('Invalid login response: missing tokens');
      }

      console.log("✅ Angel One login successful!");
      console.log("🔐 feedToken:", feedToken.substring(0, 10) + "...");
      console.log("🔑 jwtToken:", jwtToken.substring(0, 10) + "...");

      return {
        feedToken,
        jwt: jwtToken,
        clientCode: CLIENT_CODE,
        success: true
      };
    } else {
      console.error("❌ Login response received but not successful");
      console.log("Response:", JSON.stringify(res.data, null, 2));
      throw new Error('Login failed: ' + (res.data?.message || 'Unknown error'));
    }

  } catch (err) {
    console.error("❌ Angel One login failed:", err.response?.data || err.message);
    throw err;
  }
}

// Validate credentials
export function validateCredentials() {
  const required = [
    { name: 'SMARTAPI_KEY', value: SMARTAPI_KEY },
    { name: 'CLIENT_CODE', value: CLIENT_CODE },
    { name: 'TRADING_PIN', value: TRADING_PIN },
    { name: 'ANGEL_LOGIN_URL', value: ANGEL_LOGIN_URL }
  ];

  const optional = [
    { name: 'TOTP_SECRET', value: TOTP_SECRET }
  ];

  const missing = required.filter(({ name, value }) => !value || value.includes('your_') || value.includes('here'));
  const missingOptional = optional.filter(({ name, value }) => !value || value.includes('your_') || value.includes('here'));

  if (missing.length > 0) {
    console.error("❌ Missing required Angel One credentials:");
    missing.forEach(({ name }) => console.error(`   - ${name}`));
    return false;
  }

  if (missingOptional.length > 0) {
    console.warn("⚠️ Optional credentials missing (manual TOTP will be required):");
    missingOptional.forEach(({ name }) => console.warn(`   - ${name}`));
  }

  return true;
}

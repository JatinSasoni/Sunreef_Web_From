// server.js — multi-org, auto-refresh tokens; + POST /api/leads (MAIN org)
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config({ path: __dirname + "/.env" });

// Suppress noisy console output in production while keeping errors and warnings
// Removed runtime console suppression; we'll keep only meaningful logs below

// Country code to name mapping
const countryCodeToName = {
  AD: "Andorra",
  AE: "United Arab Emirates",
  AF: "Afghanistan",
  AG: "Antigua and Barbuda",
  AI: "Anguilla",
  AL: "Albania",
  AM: "Armenia",
  AO: "Angola",
  AQ: "Antarctica",
  AR: "Argentina",
  AS: "American Samoa",
  AT: "Austria",
  AU: "Australia",
  AW: "Aruba",
  AX: "Åland Islands",
  AZ: "Azerbaijan",
  BA: "Bosnia and Herzegovina",
  BB: "Barbados",
  BD: "Bangladesh",
  BE: "Belgium",
  BF: "Burkina Faso",
  BG: "Bulgaria",
  BH: "Bahrain",
  BI: "Burundi",
  BJ: "Benin",
  BL: "Saint Barthélemy",
  BM: "Bermuda",
  BN: "Brunei",
  BO: "Bolivia",
  BQ: "Caribbean Netherlands",
  BR: "Brazil",
  BS: "Bahamas",
  BT: "Bhutan",
  BV: "Bouvet Island",
  BW: "Botswana",
  BY: "Belarus",
  BZ: "Belize",
  CA: "Canada",
  CC: "Cocos Islands",
  CD: "Democratic Republic of the Congo",
  CF: "Central African Republic",
  CG: "Republic of the Congo",
  CH: "Switzerland",
  CI: "Côte d'Ivoire",
  CK: "Cook Islands",
  CL: "Chile",
  CM: "Cameroon",
  CN: "China",
  CO: "Colombia",
  CR: "Costa Rica",
  CU: "Cuba",
  CV: "Cape Verde",
  CW: "Curaçao",
  CX: "Christmas Island",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DE: "Germany",
  DJ: "Djibouti",
  DK: "Denmark",
  DM: "Dominica",
  DO: "Dominican Republic",
  DZ: "Algeria",
  EC: "Ecuador",
  EE: "Estonia",
  EG: "Egypt",
  EH: "Western Sahara",
  ER: "Eritrea",
  ES: "Spain",
  ET: "Ethiopia",
  FI: "Finland",
  FJ: "Fiji",
  FK: "Falkland Islands",
  FM: "Micronesia",
  FO: "Faroe Islands",
  FR: "France",
  GA: "Gabon",
  GB: "United Kingdom",
  GD: "Grenada",
  GE: "Georgia",
  GF: "French Guiana",
  GG: "Guernsey",
  GH: "Ghana",
  GI: "Gibraltar",
  GL: "Greenland",
  GM: "Gambia",
  GN: "Guinea",
  GP: "Guadeloupe",
  GQ: "Equatorial Guinea",
  GR: "Greece",
  GS: "South Georgia and the South Sandwich Islands",
  GT: "Guatemala",
  GU: "Guam",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HK: "Hong Kong",
  HM: "Heard Island and McDonald Islands",
  HN: "Honduras",
  HR: "Croatia",
  HT: "Haiti",
  HU: "Hungary",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IM: "Isle of Man",
  IN: "India",
  IO: "British Indian Ocean Territory",
  IQ: "Iraq",
  IR: "Iran",
  IS: "Iceland",
  IT: "Italy",
  JE: "Jersey",
  JM: "Jamaica",
  JO: "Jordan",
  JP: "Japan",
  KE: "Kenya",
  KG: "Kyrgyzstan",
  KH: "Cambodia",
  KI: "Kiribati",
  KM: "Comoros",
  KN: "Saint Kitts and Nevis",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KY: "Cayman Islands",
  KZ: "Kazakhstan",
  LA: "Laos",
  LB: "Lebanon",
  LC: "Saint Lucia",
  LI: "Liechtenstein",
  LK: "Sri Lanka",
  LR: "Liberia",
  LS: "Lesotho",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  LY: "Libya",
  MA: "Morocco",
  MC: "Monaco",
  MD: "Moldova",
  ME: "Montenegro",
  MF: "Saint Martin",
  MG: "Madagascar",
  MH: "Marshall Islands",
  MK: "North Macedonia",
  ML: "Mali",
  MM: "Myanmar",
  MN: "Mongolia",
  MO: "Macau",
  MP: "Northern Mariana Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MS: "Montserrat",
  MT: "Malta",
  MU: "Mauritius",
  MV: "Maldives",
  MW: "Malawi",
  MX: "Mexico",
  MY: "Malaysia",
  MZ: "Mozambique",
  NA: "Namibia",
  NC: "New Caledonia",
  NE: "Niger",
  NF: "Norfolk Island",
  NG: "Nigeria",
  NI: "Nicaragua",
  NL: "Netherlands",
  NO: "Norway",
  NP: "Nepal",
  NR: "Nauru",
  NU: "Niue",
  NZ: "New Zealand",
  OM: "Oman",
  PA: "Panama",
  PE: "Peru",
  PF: "French Polynesia",
  PG: "Papua New Guinea",
  PH: "Philippines",
  PK: "Pakistan",
  PL: "Poland",
  PM: "Saint Pierre and Miquelon",
  PN: "Pitcairn Islands",
  PR: "Puerto Rico",
  PS: "Palestine",
  PT: "Portugal",
  PW: "Palau",
  PY: "Paraguay",
  QA: "Qatar",
  RE: "Réunion",
  RO: "Romania",
  RS: "Serbia",
  RU: "Russia",
  RW: "Rwanda",
  SA: "Saudi Arabia",
  SB: "Solomon Islands",
  SC: "Seychelles",
  SD: "Sudan",
  SE: "Sweden",
  SG: "Singapore",
  SH: "Saint Helena",
  SI: "Slovenia",
  SJ: "Svalbard and Jan Mayen",
  SK: "Slovakia",
  SL: "Sierra Leone",
  SM: "San Marino",
  SN: "Senegal",
  SO: "Somalia",
  SR: "Suriname",
  SS: "South Sudan",
  ST: "São Tomé and Príncipe",
  SV: "El Salvador",
  SX: "Sint Maarten",
  SY: "Syria",
  SZ: "Eswatini",
  TC: "Turks and Caicos Islands",
  TD: "Chad",
  TF: "French Southern Territories",
  TG: "Togo",
  TH: "Thailand",
  TJ: "Tajikistan",
  TK: "Tokelau",
  TL: "Timor-Leste",
  TM: "Turkmenistan",
  TN: "Tunisia",
  TO: "Tonga",
  TR: "Turkey",
  TT: "Trinidad and Tobago",
  TV: "Tuvalu",
  TW: "Taiwan",
  TZ: "Tanzania",
  UA: "Ukraine",
  UG: "Uganda",
  UM: "United States Minor Outlying Islands",
  US: "United States",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VA: "Vatican City",
  VC: "Saint Vincent and the Grenadines",
  VE: "Venezuela",
  VG: "British Virgin Islands",
  VI: "U.S. Virgin Islands",
  VN: "Vietnam",
  VU: "Vanuatu",
  WF: "Wallis and Futuna",
  WS: "Samoa",
  YE: "Yemen",
  YT: "Mayotte",
  ZA: "South Africa",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

// Helper function to convert country code to full name
function getCountryName(countryCode) {
  if (!countryCode) return countryCode;
  return countryCodeToName[countryCode] || countryCode;
}

/** Normalize time for Zoho datetime: 24:00 is invalid, use 23:59 for end-of-day. */
function normalizeTimeForZoho(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return timeStr;
  const t = timeStr.trim();
  if (t === "24:00") return "23:59";
  return t;
}

// Helper function to get timezone offset for a given timezone
function getTimezoneOffset(timezone) {
  if (!timezone) {
    throw new Error("Timezone is required");
  }

  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const target = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );

    const offsetMs = target.getTime() - utc.getTime();
    const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));

    const sign = offsetHours >= 0 ? "+" : "-";
    const absHours = Math.abs(offsetHours);
    const hours = absHours.toString().padStart(2, "0");

    return `${sign}${hours}:00`;
  } catch (error) {
    console.error("Error calculating timezone offset:", error);
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

/* ===== Token refresh safety: refresh before expiry (default 60s) ===== */
const TOKEN_REFRESH_SAFETY_MS = Number(
  process.env.TOKEN_REFRESH_SAFETY_MS || 60_000
);

/* ===== ORG configs (MAIN + OTHER) ===== */
const ORGS = {
  main: {
    key: "main",
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
    ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI,
    ZOHO_TOKEN_URL: process.env.ZOHO_TOKEN_URL,
    ZOHO_CRM_BASE_URL:
      process.env.ZOHO_CRM_BASE_URL || "https://www.zohoapis.com/crm/v8",
  },
  other: {
    key: "other",
    REFRESH_TOKEN: process.env.REFRESH_TOKEN_OTHER,
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID_OTHER,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET_OTHER,
    ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI_OTHER,
    ZOHO_TOKEN_URL: process.env.ZOHO_TOKEN_URL_OTHER,
    ZOHO_CRM_BASE_URL:
      process.env.ZOHO_CRM_BASE_URL_OTHER || "https://www.zohoapis.com/crm/v8",
  },
};

// Debug: Log org configuration status
// Org configuration status (reduced noise)
Object.keys(ORGS).forEach((orgKey) => {
  const org = ORGS[orgKey];
  const hasRefreshToken = !!org.REFRESH_TOKEN;
  const hasClientId = !!org.ZOHO_CLIENT_ID;
  const hasClientSecret = !!org.ZOHO_CLIENT_SECRET;
  const hasTokenUrl = !!org.ZOHO_TOKEN_URL;
  const hasBaseUrl = !!org.ZOHO_CRM_BASE_URL;

  // minimal status kept via warnings above
  if (!hasRefreshToken)
    console.warn(`Missing REFRESH_TOKEN${orgKey === "other" ? "_OTHER" : ""}`);
  if (!hasClientId)
    console.warn(`Missing ZOHO_CLIENT_ID${orgKey === "other" ? "_OTHER" : ""}`);
  if (!hasClientSecret)
    console.warn(
      `Missing ZOHO_CLIENT_SECRET${orgKey === "other" ? "_OTHER" : ""}`
    );
  if (!hasTokenUrl)
    console.warn(`Missing ZOHO_TOKEN_URL${orgKey === "other" ? "_OTHER" : ""}`);
  if (!hasBaseUrl)
    console.warn(
      `Missing ZOHO_CRM_BASE_URL${orgKey === "other" ? "_OTHER" : ""}`
    );
});
// ---- Zoho Creator config ----
const CREATOR_BASE_URL =
  process.env.CREATOR_BASE_URL || "https://creator.zoho.com/api/v2";
const CREATOR_OWNER = process.env.CREATOR_OWNER; // e.g., "sunreef_yachts"
// CREATOR_APP removed - now using dynamic appName from event configurations
const CREATOR_REPORT =
  process.env.CREATOR_REPORT || "Sales_Representative_Report";

const CREATOR_DATA_BASE_URL =
  process.env.CREATOR_DATA_BASE_URL ||
  "https://www.zohoapis.com/creator/v2.1/data";
const CREATOR_FORM = process.env.CREATOR_FORM || "Leads";
const CREATOR_ENV = process.env.CREATOR_ENV; // development | stage (omit => production)
const CREATOR_DEMO_USER = process.env.CREATOR_DEMO_USER; // e.g., demouser_1

// ---- Tour Guide Mapping for OTHER org ----
// DEPRECATED: No longer used. User resolution now follows MAIN org pattern:
// 1. Fetch users from OTHER org and match by name
// 2. If not found, use Default_Charter_User_ID from event configuration
// const OTHER_ORG_TOUR_GUIDES = {
//   "Antonia Markou": "6286709000010380001",
//   "Carole Madar": "6286709000000682001",
//   "Antoine": "6286709000003498001"
// };

// ---- Default User IDs for both orgs ----
const DEFAULT_USER_MAIN = "4356972000072768001"; // Mahesh Uttwani - MAIN org
const DEFAULT_USER_OTHER = "6286709000010380001"; // Antonia Markou - OTHER org (default)
const CREATOR_SKIP_WORKFLOW = (process.env.CREATOR_SKIP_WORKFLOW || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---- Campaign Configuration ----
const CAMPAIGN_ID = "4356972000196446818"; // Default campaign ID for adding leads (MAIN org)
const CAMPAIGN_ID_OTHER = "6286709000012457001"; // Campaign ID for OTHER org
const CAMPAIGN_MEMBER_STATUS = "Active"; // Default member status

function getOrgConfig(key = "main") {
  return ORGS[key] || ORGS.main;
}

/* ===== Helper function to find user ID by name (only active users) ===== */
async function findUserIdByName(orgKey, userName) {
  try {
    const usersResult = await fetchUsersForOrg(orgKey, {
      type: "AllUsers",
      per_page: 200,
    });

    if (!usersResult.success || !usersResult.data) {
      console.error(`[${orgKey}] Failed to fetch users for name lookup`);
      return null;
    }

    // Filter to only active users (exclude deleted and disabled)
    const activeUsers = usersResult.data.filter(
      (user) => user.status === "active"
    );

    // reduced verbose log

    // Normalize the search name (remove extra spaces, convert to lowercase)
    const normalizedSearchName = userName.trim().toLowerCase();

    // Find exact match first (only in active users)
    let foundUser = activeUsers.find(
      (user) =>
        user.name && user.name.trim().toLowerCase() === normalizedSearchName
    );

    // If no exact match, try partial match (only in active users)
    if (!foundUser) {
      foundUser = activeUsers.find(
        (user) =>
          user.name &&
          user.name.trim().toLowerCase().includes(normalizedSearchName)
      );
    }

    if (foundUser) {
      return foundUser.id;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`[${orgKey}] Error finding user by name:`, error);
    return null;
  }
}

/** Log Zoho CRM API errors with full nested details (console.log shows [Object] otherwise). */
function logZohoCrmApiError(context, status, responseBody, requestPayload) {
  console.error(`\n========== ${context} ==========`);
  console.error(`HTTP status: ${status}`);
  if (requestPayload !== undefined && requestPayload !== null) {
    try {
      console.error(
        "Request payload (data[0]):",
        JSON.stringify(requestPayload, null, 2)
      );
    } catch (e) {
      console.error("Request payload (could not stringify):", requestPayload);
    }
  }
  if (responseBody === undefined || responseBody === null) {
    console.error("Response body: (empty)");
    console.error("========================================\n");
    return;
  }
  try {
    console.error(
      "Response body (full):",
      JSON.stringify(responseBody, null, 2)
    );
  } catch (e) {
    console.error("Response body (raw):", responseBody);
  }
  const rows = responseBody?.data;
  if (Array.isArray(rows)) {
    rows.forEach((row, i) => {
      console.error(`--- Zoho row[${i}] ---`);
      console.error(
        `  code: ${row?.code}, status: ${row?.status}, message: ${row?.message}`
      );
      if (row?.details !== undefined) {
        try {
          console.error(`  details:`, JSON.stringify(row.details, null, 2));
        } catch (e2) {
          console.error(`  details (raw):`, row.details);
        }
      }
    });
  }
  console.error("========================================\n");
}

/* ===== Function to create meeting in Zoho CRM Events module ===== */
async function createMeetingInCRM(orgKey, meetingData) {
  try {
    const cfg = getOrgConfig(orgKey);
    const token = await getTokenManager(orgKey).get();

    const url = `${cfg.ZOHO_CRM_BASE_URL}/Events`;

    // Format dates properly for Zoho CRM (YYYY-MM-DDTHH:mm:ss+02:00 format for Monaco timezone)
    const formatDateTimeForZoho = (dateTimeStr) => {
      if (!dateTimeStr) return null;

      // If the string already has timezone info, use it as is
      if (dateTimeStr.includes("+") || dateTimeStr.includes("-")) {
        return dateTimeStr;
      }

      // If no timezone, assume it's Monaco time and add +02:00
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return null;

      // Format as YYYY-MM-DDTHH:mm:ss+02:00 (Monaco timezone)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+02:00`;
    };

    // Link to Lead (What_Id) or Contact (Who_Id)
    const linkToLead = !!meetingData.leadId;
    const linkToContact = !!meetingData.contactId;
    const meetingRecord = {
      // Core required fields
      Subject: meetingData.title || "Boat Show Meeting",
      Start_DateTime: formatDateTimeForZoho(meetingData.startDateTime),
      End_DateTime: formatDateTimeForZoho(meetingData.endDateTime),
      Owner: meetingData.ownerId, // Host/Tour Given By user ID
      Name_of_the_Boat_Show: meetingData.boatShowName, // Map Boat Show name
      // Module and related record: Lead or Contact
      $se_module: linkToContact ? "Contacts" : "Leads",
      // Additional fields that might be required
      Event_Title: meetingData.title || "Boat Show Meeting",
      Meeting_Venue__s: meetingData.venue || "Client location",
      Location: meetingData.venue || "Client location",
      Event_Type: "Meeting",
      Status: "Not Started",
      All_day: false,
      Description:
        meetingData.description ||
        `Meeting with ${meetingData.title || "client"} for boat show`,
    };
    if (linkToLead) {
      meetingRecord.What_Id = meetingData.leadId;
    }
    if (linkToContact) {
      meetingRecord.Who_Id = meetingData.contactId;
    }

    // removed verbose log

    const response = await axios.post(
      url,
      { data: [meetingRecord] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 201 || response.status === 200) {
      const result = response.data?.data?.[0];
      // removed verbose log
      return {
        success: true,
        meetingId: result?.details?.id,
        message: "Meeting created successfully",
      };
    } else {
      console.error(`[${orgKey}] Meeting creation failed:`, response.data);
      console.error(
        `[${orgKey}] Full error details:`,
        JSON.stringify(response.data, null, 2)
      );
      return {
        success: false,
        error: response.data,
        message: "Meeting creation failed",
      };
    }
  } catch (error) {
    console.error(
      `[${orgKey}] Error creating meeting:`,
      error?.response?.data || error.message
    );
    return {
      success: false,
      error: error?.response?.data || { message: error.message },
      message: "Error creating meeting",
    };
  }
}

/* ===== TokenManager (per org) ===== */
class TokenManager {
  constructor(cfg) {
    this.cfg = cfg;
    this.token = null;
    this.expiry = 0;
    this.refreshing = null;
  }
  async get() {
    const now = Date.now();
    if (this.token && now < this.expiry - TOKEN_REFRESH_SAFETY_MS)
      return this.token;
    return this.refresh();
  }
  async refresh() {
    if (this.refreshing) return this.refreshing;
    const {
      ZOHO_TOKEN_URL,
      ZOHO_CLIENT_ID,
      ZOHO_CLIENT_SECRET,
      ZOHO_REDIRECT_URI,
      REFRESH_TOKEN,
      key,
    } = this.cfg;
    if (
      !REFRESH_TOKEN ||
      !ZOHO_CLIENT_ID ||
      !ZOHO_CLIENT_SECRET ||
      !ZOHO_TOKEN_URL
    ) {
      throw new Error(`[${key}] Missing OAuth env vars`);
    }
    const url =
      `${ZOHO_TOKEN_URL}?grant_type=refresh_token` +
      `&client_id=${encodeURIComponent(ZOHO_CLIENT_ID)}` +
      `&client_secret=${encodeURIComponent(ZOHO_CLIENT_SECRET)}` +
      `&redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI || "")}` +
      `&refresh_token=${encodeURIComponent(REFRESH_TOKEN)}`;

    this.refreshing = axios
      .post(url)
      .then((res) => {
        const data = res.data || {};
        if (!data.access_token) {
          // Log the full response to help diagnose the issue
          console.error(
            `[zoho:${key}] Token refresh response missing access_token:`,
            {
              status: res.status,
              statusText: res.statusText,
              responseData: data,
              error: data.error,
              error_description: data.error_description,
            }
          );
          throw new Error(
            `[${key}] Access token missing. Zoho response: ${JSON.stringify(
              data
            )}`
          );
        }
        const expiresSec = Number(data.expires_in) || 600;
        this.token = data.access_token;
        this.expiry = Date.now() + expiresSec * 1000;
        // token refreshed silently
        return this.token;
      })
      .catch((err) => {
        // Enhanced error logging for better debugging
        const errorDetails = {
          org: key,
          message: err.message,
          responseStatus: err?.response?.status,
          responseStatusText: err?.response?.statusText,
          responseData: err?.response?.data,
          zohoError: err?.response?.data?.error,
          zohoErrorDescription: err?.response?.data?.error_description,
          requestUrl: url.replace(/refresh_token=[^&]+/, "refresh_token=***"), // Mask refresh token in logs
        };

        throw err;
      })
      .finally(() => {
        this.refreshing = null;
      });

    return this.refreshing;
  }
}

/* create token managers for configured orgs */
const tokenManagers = new Map();
for (const k of Object.keys(ORGS)) {
  const cfg = ORGS[k];
  if (cfg.REFRESH_TOKEN) tokenManagers.set(k, new TokenManager(cfg));
}
function getTokenManager(key = "main") {
  const tm = tokenManagers.get(key);
  if (!tm) throw new Error(`Org '${key}' not configured (missing envs)`);
  return tm;
}

/* ===== Date helpers & filters ===== */
function toEndOfDay(d) {
  const t = new Date(d);
  t.setHours(23, 59, 59, 999);
  return t;
}
function parseDateFlexible(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const [, Y, M, D] = m.map(Number);
    const d = new Date(Y, M - 1, D, 0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const [, D, M, Y] = m.map(Number);
    const d = new Date(Y, M - 1, D, 0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }
  m = s.match(/^(\d{1,2})-(\d{2})(\d{4})$/);
  if (m) {
    const [, D, MM, YYYY] = m;
    const d = new Date(Number(YYYY), Number(MM) - 1, Number(D), 0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }
  m = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) {
    const [, DD, MM, YYYY] = m;
    const d = new Date(Number(YYYY), Number(MM) - 1, Number(DD), 0, 0, 0, 0);
    return isNaN(d) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function matchesWindow(
  eventStartISO,
  eventEndISO,
  winStart,
  winEnd,
  mode = "start_within"
) {
  if (!winStart && !winEnd) return true;
  const es = eventStartISO ? new Date(eventStartISO) : null;
  const ee = eventEndISO ? new Date(eventEndISO) : null;
  if (!es && !ee) return false;
  const start = es || ee;
  const end = ee || es;
  if (mode === "inside") {
    if (winStart && start < winStart) return false;
    if (winEnd && end > winEnd) return false;
    return true;
  }
  if (mode === "overlap") {
    if (winStart && end < winStart) return false;
    if (winEnd && start > winEnd) return false;
    return true;
  }
  if (winStart && start < winStart) return false;
  if (winEnd && start > winEnd) return false;
  return true;
}

/* ===== Fetch Events for ONE org (pagination) ===== */
async function fetchEventsForOrg(orgKey, options = {}) {
  const {
    per_page = 200,
    sort_by = "Modified_Time", // allowed: id | Created_Time | Modified_Time
    sort_order = "desc",
    maxPages = Infinity,
    start,
    end,
    filter_mode = "start_within",
  } = options;

  const cfg = getOrgConfig(orgKey);
  if (!cfg.ZOHO_CRM_BASE_URL)
    throw new Error(`[${orgKey}] Missing ZOHO_CRM_BASE_URL`);
  const token = await getTokenManager(orgKey).get();

  const fields =
    "Owner,Start_DateTime,End_DateTime,Who_Id,What_Id,Subject,Participants";
  const winStart = start ? parseDateFlexible(start) : null;
  const winEnd = end ? toEndOfDay(parseDateFlexible(end)) : null;

  const pickOwnerName = (o) =>
    (o && (o.name || o.$name || o.full_name || o.$full_name || o.email)) || "";
  // NEW:
  const pickLookup = (x) => {
    if (!x || typeof x !== "object") return null;
    const id = x.id || x.$id;
    const name = x.name || x.$name || x.full_name || x.$full_name || "";
    // v8 may expose module as $module or type
    const module = x.$module || x.type || x.api_name || "";
    return { id, name, module };
  };

  const pickClientFromEvent = (r) => {
    // Priority 1: Who_Id (Contact/Lead)
    const who = pickLookup(r.Who_Id);
    if (who && who.name) return { source: "who", ...who };

    // Priority 2: Participants (fallback to first external participant’s name/email)
    if (Array.isArray(r.Participants) && r.Participants.length) {
      const p = r.Participants.find((pp) => pp.name) || r.Participants[0];
      const pName = p.name || p.email || "";
      if (pName)
        return {
          source: "participant",
          id: p.id || null,
          name: pName,
          module: "Participant",
        };
    }

    // Priority 3: What_Id (Account/Deal/etc.)
    const what = pickLookup(r.What_Id);
    if (what && what.name) return { source: "what", ...what };

    return { source: "unknown", id: null, name: "", module: "" };
  };
  const ALLOWED_SORT = new Set(["id", "Created_Time", "Modified_Time"]);

  const out = [];
  let page_token = null,
    page = 1,
    pages = 0;

  do {
    const params = new URLSearchParams({ fields, per_page: String(per_page) });
    if (sort_by && ALLOWED_SORT.has(sort_by)) {
      params.append("sort_by", sort_by);
      params.append("sort_order", sort_order || "desc");
    }
    if (page_token) params.append("page_token", page_token);
    else params.append("page", String(page));

    const url = `${cfg.ZOHO_CRM_BASE_URL}/Events?${params.toString()}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      const body = res.data;
      throw Object.assign(new Error(`[${orgKey}] Events fetch failed`), {
        status: res.status,
        code: body?.code,
        body,
      });
    }

    const payload = res.data || {};
    const rows = payload.data || [];
    const info = payload.info || {};

    for (const r of rows) {
      if (
        matchesWindow(
          r.Start_DateTime,
          r.End_DateTime,
          winStart,
          winEnd,
          String(filter_mode).toLowerCase()
        )
      ) {
        const client = pickClientFromEvent(r);
        out.push({
          org: orgKey,
          name: pickOwnerName(r.Owner), // Sales person (Owner)
          start_date: r.Start_DateTime ?? null,
          end_date: r.End_DateTime ?? null,
          subject: r.Subject || null, // optional but handy
          client: {
            // ← NEW block
            id: client.id,
            name: client.name,
            module: client.module, // "Leads" | "Contacts" | "Accounts" | "Participant" | ""
            source: client.source, // "who" | "participant" | "what" | "unknown"
          },
        });
      }
    }

    page_token = info.next_page_token || null;
    page += 1;
    pages += 1;
    if (pages >= maxPages) break;
  } while (page_token);

  return { success: true, org: orgKey, pages, count: out.length, data: out };
}

/* ===== Fetch from BOTH orgs (default) ===== */
async function fetchEventsBoth(options = {}) {
  const enabledOrgs = Object.keys(ORGS).filter((k) => !!ORGS[k].REFRESH_TOKEN);
  const wantBoth =
    enabledOrgs.includes("main") && enabledOrgs.includes("other");
  const targets = wantBoth ? ["main", "other"] : [enabledOrgs[0]];

  const [a, b] = await Promise.allSettled(
    targets.map((k) => fetchEventsForOrg(k, options))
  );

  const results = [];
  const meta = {};
  const errors = {};
  targets.forEach((k, idx) => {
    const r = [a, b][idx];
    if (!r) return;
    if (r.status === "fulfilled") {
      results.push(...(r.value?.data || []));
      meta[k] = { pages: r.value.pages, count: r.value.count };
    } else {
      errors[k] = r.reason?.body || {
        message: r.reason?.message || "Unknown error",
      };
      meta[k] = { pages: 0, count: 0 };
    }
  });

  results.sort(
    (x, y) => Date.parse(x.start_date || 0) - Date.parse(y.start_date || 0)
  );
  const total = results.length;
  return {
    success: true,
    orgs: targets,
    meta,
    total,
    data: results,
    errors: Object.keys(errors).length ? errors : undefined,
  };
}

/* ===== Express app ===== */
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-API-Secret"],
  })
);
/* IMPORTANT for POST body */
app.use(express.json());

// API Secret Authentication Middleware
const validateApiSecret = (req, res, next) => {
  // Skip validation for health check and root endpoint
  if (req.path === "/health" || req.path === "/") {
    return next();
  }
  // Always allow CORS preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const clientSecret =
    req.headers["x-api-secret"] || req.headers["X-API-Secret"];
  const serverSecret = process.env.API_SECRET;

  if (!clientSecret || !serverSecret) {
    return res.status(401).json({
      success: false,
      error: "API secret is required",
    });
  }

  if (clientSecret !== serverSecret) {
    return res.status(401).json({
      success: false,
      error: "Invalid API secret",
    });
  }

  next();
};

// Apply API secret validation to all API routes
app.use("/api", validateApiSecret);

// Health
app.get("/", (_, res) =>
  res.json({ message: "Sunreef Yacht Backend Server is running" })
);
app.get("/health", (_, res) => res.send("ok"));
app.get("/api/orgs", (_, res) => {
  const list = Object.keys(ORGS).filter((k) => !!ORGS[k].REFRESH_TOKEN);
  res.json({ success: true, orgs: list });
});

// Get detailed org configuration status
app.get("/api/orgs/status", (_, res) => {
  const orgStatus = {};

  Object.keys(ORGS).forEach((orgKey) => {
    const org = ORGS[orgKey];
    const hasRefreshToken = !!org.REFRESH_TOKEN;
    const hasClientId = !!org.ZOHO_CLIENT_ID;
    const hasClientSecret = !!org.ZOHO_CLIENT_SECRET;
    const hasTokenUrl = !!org.ZOHO_TOKEN_URL;
    const hasBaseUrl = !!org.ZOHO_CRM_BASE_URL;

    orgStatus[orgKey] = {
      configured:
        hasRefreshToken && hasClientId && hasClientSecret && hasTokenUrl,
      hasRefreshToken,
      hasClientId,
      hasClientSecret,
      hasTokenUrl,
      hasBaseUrl,
      baseUrl: org.ZOHO_CRM_BASE_URL,
    };
  });

  res.json({
    success: true,
    orgs: orgStatus,
    availableOrgs: Object.keys(ORGS).filter((k) => !!ORGS[k].REFRESH_TOKEN),
  });
});

// Token peek (per org)
app.get("/api/auth/token", async (req, res) => {
  try {
    const org = (req.query.org || "main").toString();
    const tm = getTokenManager(org);
    const token = await tm.get();
    res.json({
      success: true,
      org,
      access_token: token,
      expires_at: tm.expiry,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ===== EVENTS: default = BOTH ORGS if possible ===== */
app.get("/api/events/all", async (req, res) => {
  try {
    const {
      org,
      per_page = 200,
      sort_by,
      sort_order,
      maxPages,
      start,
      end,
      filter_mode,
      group,
    } = req.query;

    // Add caching headers for better performance
    res.set({
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      ETag: `events-${start}-${end}-${filter_mode}-${group}`,
      Vary: "Accept-Encoding",
    });

    const q = {
      per_page: parseInt(per_page, 10),
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
      maxPages: maxPages ? parseInt(maxPages, 10) : undefined,
      start: start || undefined,
      end: end || undefined,
      filter_mode: filter_mode || undefined,
    };

    const enabledOrgs = Object.keys(ORGS).filter(
      (k) => !!ORGS[k].REFRESH_TOKEN
    );
    const bothAvailable =
      enabledOrgs.includes("main") && enabledOrgs.includes("other");

    let result;
    if (
      (org || "").toLowerCase() === "main" ||
      (org || "").toLowerCase() === "other"
    ) {
      result = await fetchEventsForOrg((org || "main").toLowerCase(), q);
      result = {
        success: true,
        orgs: [result.org],
        meta: { [result.org]: { pages: result.pages, count: result.count } },
        total: result.count,
        data: result.data,
      };
    } else if ((org || "").toLowerCase() === "both" || bothAvailable) {
      result = await fetchEventsBoth(q);
    } else {
      const only = enabledOrgs[0] || "main";
      const r = await fetchEventsForOrg(only, q);
      result = {
        success: true,
        orgs: [r.org],
        meta: { [r.org]: { pages: r.pages, count: r.count } },
        total: r.count,
        data: r.data,
      };
    }

    if (String(group) === "true") {
      const map = new Map();
      for (const r of result.data) {
        const key = `${r.name}||${r.org}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({ start_date: r.start_date, end_date: r.end_date });
      }
      for (const slots of map.values()) {
        slots.sort(
          (a, b) =>
            Date.parse(a.start_date || 0) - Date.parse(b.start_date || 0)
        );
      }
      const users = Array.from(map.entries())
        .map(([key, slots]) => {
          const [name, org] = key.split("||");
          return { org, name, count: slots.length, slots };
        })
        .sort(
          (a, b) => a.name.localeCompare(b.name) || a.org.localeCompare(b.org)
        );

      return res.json({
        success: true,
        orgs: result.orgs,
        window: {
          start: req.query.start,
          end: req.query.end,
          mode: req.query.filter_mode || "start_within",
        },
        meta: result.meta,
        total_meetings: result.total,
        count_users: users.length,
        users,
        errors: result.errors,
      });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "Error in /api/events/all:",
      error?.response?.data || error.message
    );
    const status = error?.status || error?.response?.status || 500;
    const payload = error?.body ||
      error?.response?.data || {
        code: "INTERNAL_ERROR",
        message: error.message || "Internal error",
      };
    res.status(status).json({ success: false, error: { status, ...payload } });
  }
});

// Fetch rows from Zoho Creator "Sales Representative" report
async function fetchCreatorSalesReps(options = {}) {
  const {
    from = 1, // Creator is 1-based
    limit = 200, // Creator max 200
    criteria, // optional Creator criteria string, e.g. (First_Name == "Ahsan")
    report = CREATOR_REPORT,
    appName, // REQUIRED: Creator app name from event configurations
  } = options;

  if (!CREATOR_OWNER) {
    throw new Error("CREATOR_OWNER must be set in .env");
  }

  if (!appName) {
    throw new Error("appName parameter is required");
  }

  const token = await getTokenManager("main").get(); // reuse your main org access token
  const base = `${CREATOR_BASE_URL}/${encodeURIComponent(
    CREATOR_OWNER
  )}/${encodeURIComponent(appName)}/report/${encodeURIComponent(report)}`;

  const params = new URLSearchParams();
  params.set("from", String(from));
  params.set("limit", String(Math.min(limit, 200)));
  if (criteria) params.set("criteria", criteria);

  const url = `${base}?${params.toString()}`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    validateStatus: () => true,
  });

  if (resp.status !== 200) {
    const errBody = resp.data;
    throw Object.assign(new Error("Zoho Creator fetch failed"), {
      status: resp.status,
      code: errBody?.code,
      body: errBody,
    });
  }

  const payload = resp.data || {};
  const rows = Array.isArray(payload.data) ? payload.data : [];
  return {
    success: true,
    from,
    limit,
    count: rows.length,
    more_records: !!payload.more_records,
    data: rows,
  };
}
// GET /api/creator/sales-reps?from=1&limit=200&criteria=(First_Name == "Ahsan")&appName=miami-boat-show
app.get("/api/creator/sales-reps", async (req, res) => {
  try {
    const from = req.query.from ? parseInt(String(req.query.from), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 200;
    const criteria = req.query.criteria
      ? String(req.query.criteria)
      : undefined;
    const report = req.query.report ? String(req.query.report) : CREATOR_REPORT;
    const appName = req.query.appName ? String(req.query.appName) : undefined;

    if (!appName) {
      return res.status(400).json({
        success: false,
        error: { message: "appName parameter is required" },
      });
    }

    const result = await fetchCreatorSalesReps({
      from,
      limit,
      criteria,
      report,
      appName,
    });
    res.json(result);
  } catch (err) {
    console.error(
      "Error in /api/creator/sales-reps:",
      err?.body || err.message
    );
    const status = err?.status || 500;
    res.status(status).json({
      success: false,
      error: err?.body || { message: err.message || "Internal error" },
    });
  }
});

// Fetch Event Configurations report data from Zoho Creator
async function fetchCreatorEventConfigurations() {
  const report = "All_Event_Configurations";
  const appName = "event-configuration"; // Fixed app name for this specific route

  if (!CREATOR_OWNER) {
    throw new Error("CREATOR_OWNER must be set in .env");
  }

  const token = await getTokenManager("main").get(); // reuse your main org access token
  const base = `${CREATOR_BASE_URL}/${encodeURIComponent(
    CREATOR_OWNER
  )}/${encodeURIComponent(appName)}/report/${encodeURIComponent(report)}`;

  // Fetch all data in one call - no query parameters
  const url = base;
  const resp = await axios.get(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    validateStatus: () => true,
  });

  if (resp.status !== 200) {
    const errBody = resp.data;
    throw Object.assign(
      new Error("Zoho Creator Event Configurations fetch failed"),
      {
        status: resp.status,
        code: errBody?.code,
        body: errBody,
      }
    );
  }

  const payload = resp.data || {};
  const rows = Array.isArray(payload.data) ? payload.data : [];

  // Map the fields to the expected structure (include Set_Postal_Code_Mandatory for frontend validation)
  const mappedRows = rows.map((row) => ({
    Creator_App_Name: row.Creator_App_Name,
    Event_Heading: row.Event_Heading,
    Boat_Show_Name: row.Boat_Show_Name,
    Event_Start_Date: row.Event_Start_Date,
    Event_End_Date: row.Event_End_Date,
    Model_Interested_In: row.Model_Interested_In,
    Country: row.Country,
    Default_Sunreef_User: row.Default_Sunreef_User,
    Default_Charter_User_ID: row.Default_Charter_User_ID,
    Sunreef_Yacht_Campaign_ID: row.Sunreef_Yacht_Campaign_ID,
    Charter_Campaign_ID: row.Charter_Campaign_ID,
    Set_Postal_Code_Mandatory: row.Set_Postal_Code_Mandatory,
    Ports: Array.isArray(row.Ports) ? row.Ports : [],
    _raw: row,
  }));

  // Get unique Creator_App_Name values from the response
  const uniqueAppNames = [
    ...new Set(mappedRows.map((row) => row.Creator_App_Name).filter(Boolean)),
  ];
  // removed verbose listing of app names

  // Fetch data from each unique app name
  const matchedData = [];
  for (const creatorAppName of uniqueAppNames) {
    try {
      // removed verbose app fetch log

      // Make dynamic API call to each Creator_App_Name
      const dynamicBase = `${CREATOR_BASE_URL}/${encodeURIComponent(
        CREATOR_OWNER
      )}/${encodeURIComponent(creatorAppName)}/report/All_App_Names`;
      const dynamicResp = await axios.get(dynamicBase, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
        validateStatus: () => true,
      });

      if (dynamicResp.status === 200) {
        const dynamicPayload = dynamicResp.data || {};
        const dynamicRows = Array.isArray(dynamicPayload.data)
          ? dynamicPayload.data
          : [];

        // Find matching records where Creator_App_Name matches
        const matchingRecords = dynamicRows.filter(
          (dynamicRow) => dynamicRow.Creator_App_Name === creatorAppName
        );

        // removed verbose count log

        // Add the matched data with app name context
        matchedData.push({
          app_name: creatorAppName,
          count: matchingRecords.length,
          data: matchingRecords,
          _raw_response: dynamicPayload,
        });
      } else {
        console.error(
          `❌ Failed to fetch data from app ${creatorAppName}:`,
          dynamicResp.status,
          dynamicResp.data
        );
      }
    } catch (error) {
      console.error(
        `❌ Error fetching data from app ${creatorAppName}:`,
        error.message
      );
    }
  }

  // Build a set of app names that had at least one matching record
  const matchedAppNames = new Set(
    matchedData.filter((x) => (x.count || 0) > 0).map((x) => x.app_name)
  );

  // Filter original rows to only those whose Creator_App_Name matched
  const filteredRows = mappedRows.filter((r) =>
    matchedAppNames.has(r.Creator_App_Name)
  );

  return {
    success: true,
    count: filteredRows.length,
    more_records: !!payload.more_records,
    data: filteredRows,
    // Keep extras for debugging/inspection if needed
    original_count: mappedRows.length,
    matched_app_names: Array.from(matchedAppNames),
    matched_data: matchedData,
    _raw_response: payload,
  };
}

// GET /api/creator/reports/event-configurations - Fetch all Event Configurations data
app.get("/api/creator/reports/event-configurations", async (req, res) => {
  try {
    // removed verbose fetch log

    const result = await fetchCreatorEventConfigurations();

    // removed verbose success log
    res.json(result);
  } catch (err) {
    console.error(
      "Error in /api/creator/reports/event-configurations:",
      err?.body || err.message
    );
    const status = err?.status || 500;
    res.status(status).json({
      success: false,
      error: err?.body || { message: err.message || "Internal error" },
    });
  }
});

/* ======== NEW: POST /api/leads (MAIN org) ======== */
/* Accepts:
   - a single lead object: { Last_Name: "...", Company: "...", Email: "...", ... }
   - or { data: [ { ... }, { ... } ] } for bulk
*/
/* Frontend → CRM field mapping + defaults for mandatory fields
   Defaults (only if not provided in body):
   - Lead_Status     = "new"
   - Lead_Source_1   = "Boat Show/ Sunreef Events"
   - Further_Source  = "Boat Show/ Events"
   - Business_Unit   = "Sunreef Yachts"
   - Boat_Show       = "Monaco 2025"
*/
app.post("/api/leads", async (req, res) => {
  try {
    const raw = req.body;

    // Normalize input to an array of items
    let items = [];
    if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (Array.isArray(raw)) items = raw;
    else if (raw && typeof raw === "object") items = [raw];

    if (!items.length) {
      return res.status(400).json({
        success: false,
        module: "Leads",
        message: "Invalid body. Send an object or { data: [ ... ] }",
      });
    }

    // helper: strip undefined/null/empty string
    const clean = (obj) => {
      const out = {};
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (typeof v === "string" && v.trim() === "") return;
        out[k] = v;
      });
      return out;
    };

    // Map one frontend item → Zoho Leads record
    const mapLead = async (input, boatShowName, sunreefYachtCampaignId) => {
      // Address fields removed - no street combination needed

      const record = {
        // Required dynamic fields from form
        Last_Name: input.Last_Name ?? input.lastName, // REQUIRED
        First_Name: input.First_Name ?? input.firstName,
        Email: input.Email ?? input.email,
        Mobile: input.Mobile ?? input.mobile,

        // Address mapping
        City: input.City ?? input.city,
        State: input.State ?? input.state,
        Postal_Code: input.Zip_Code ?? input.postal,
        Countries: getCountryName(input.Country ?? input.country), // Convert country code to full name
        // Countries: getCountryName(input.Countries ?? input.country),

        // Boat & interest
        Current_Boat_type: input.Current_Boat_type ?? input.boatType,
        Model_Type: input.Model_Type ?? input.modelInterested,

        // 👇 NEW: map your two UI fields to CRM API names
        Budget_Range:
          input.Budget_Range ??
          input.budgetAllocation ?? // Frontend field name
          input.budgetRange ?? // Alternative alias
          input.budget, // Any other alias
        Yacht_Purchase_Timeline:
          input.Yacht_Purchase_Timeline ??
          input.purchaseTimeline ?? // Frontend field name
          input.yachtPurchaseTimeline, // Alternative alias

        // 👇 NEW: map interestedCharter field to CRM
        Interested_in_charter:
          input.Interested_in_Charter ??
          input.interestedCharter ?? // Frontend field name
          input.interestedInCharter ?? // Alternative alias
          input.charterInterest, // Any other alias

        // 👇 NEW: map currentOwner field to CRM
        Yacht_Owner:
          input.Yacht_Owner ??
          input.currentOwner ?? // Frontend field name
          input.currentBoatOwner, // Alternative alias

        // 👇 NEW: map isBroker field to CRM
        Broker:
          input.Broker ??
          input.isBroker ?? // Frontend field name
          input.broker, // Alternative alias

        // Notes - Create comprehensive description
        Description: (() => {
          const parts = [];

          // Add boat show info
          parts.push(`Boat Show : ${boatShowName}`);

          // Add tour given by info
          const tourGivenBy = input.Tour_Given_By ?? input.tourGivenBy;
          if (tourGivenBy) {
            parts.push(`Tour Given By: ${tourGivenBy}`);
          }

          // Add date/time info
          const fromDate = input.fromDate;
          const fromTime = input.fromTime;
          const toTime = input.toTime;

          if (fromDate && fromTime && toTime) {
            parts.push(
              `From: ${fromDate} ${fromTime} To: ${fromDate} ${toTime}`
            );
          }

          // Add purpose of visit
          const purpose = input.Are_you_here_for ?? input.hereFor;
          if (purpose) {
            parts.push(`Please tell us the purpose of your visit: ${purpose}`);
          }

          // Add notes
          const notes = input.Additional_notes ?? input.notes;
          if (notes) {
            parts.push(`Notes: ${notes}`);
          }

          return parts.join("\n");
        })(),

        // --- Lead Owner Logic ---
        Owner: (() => {
          // Prefer explicit "Tour Given By" name (resolved to ID later)
          const tourGivenBy = input.Tour_Given_By ?? input.tourGivenBy;
          if (tourGivenBy) {
            // We'll resolve this user name to an ID in the main flow
            return tourGivenBy;
          }
          // If no name provided, use Default_Sunreef_User (already an ID from Creator config) when available
          if (input.defaultSunreefUserId) {
            return input.defaultSunreefUserId;
          }
          // Final fallback: hardcoded default
          return DEFAULT_USER_MAIN;
        })(),

        // --- Defaults for mandatory picklists (set only if not provided by caller) ---
        Lead_Status: input.Lead_Status ?? "new",
        Lead_Source_1: input.Lead_Source_1 ?? "Boat Show/ Sunreef Events",
        Further_Source: input.Further_Source ?? "Boat Show/ Events",
        Business_Unit: input.Business_Unit ?? "Sunreef Yachts",
        Boat_Show: boatShowName, // Dynamic field for boat show
        Event_Boat_Show: sunreefYachtCampaignId, // Dynamic campaign ID for MAIN org
        Boat_Show_Port: input.Boat_Show_Port ?? input.boatShowPort ?? undefined,

        // --- Boat Show stand / meeting fields ---
        Tour_Given_By1: input.Tour_Given_By ?? input.tourGivenBy ?? undefined,
        Tour_Given_By_Mobile:
          input.Tour_Given_By_Mobile ?? input.tourGivenByMobile ?? undefined,
        Boat_Show_Stand_Meeting_Date: formatDateDDMMMYYYY(
          input.fromDate ?? input.From_Date
        ),
        Boat_Show_Stand_Meeting_Time: formatTime12Hour(
          input.fromTime ?? input.From_Time
        ),
        Boat_Show_Stand_Interested_Yacht:
          input.Boat_Show_Stand_Interested_Yacht ||
          input.modelInterested ||
          input.Model_Type ||
          "Not Sure",

        // --- AI Enrichment fields (populated when enrichment ran before submit) ---
        AI_Enriched_Profile_Summary:
          input.AI_Enriched_Profile_Summary ??
          input.profileSummary ??
          undefined,
        AI_Lead_Score: input.AI_Lead_Score ?? input.aiLeadScore ?? undefined,
        AI_Wealth_Category:
          input.AI_Wealth_Category ?? input.wealthCategory ?? undefined,
        Enrich_Count:
          input.AI_Enriched_Profile_Summary || input.profileSummary
            ? 1
            : undefined,

        // --- Mandatory fields for OTHER org ---
        Preferred_Language: input.Preferred_Language ?? "English", // Default to English
        Lead_Source: input.Lead_Source ?? "Boat Show/ Sunreef Events", // Mandatory field for OTHER org
      };

      return clean(record);
    };

    // Build payload; validate Last_Name

    // Map items and resolve Owner field
    // Extract boatShowName and campaign IDs from the first item (all items should have the same boat show)
    const boatShowName = items[0]?.boatShowName;
    const sunreefYachtCampaignId = items[0]?.sunreefYachtCampaignId;
    const charterCampaignId = items[0]?.charterCampaignId;

    // Validate that boatShowName is provided
    if (!boatShowName || boatShowName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          message: "boatShowName is required and cannot be empty",
          code: "MISSING_BOAT_SHOW_NAME",
        },
      });
    }

    // Campaign IDs are optional - no validation needed

    // Validate timezone and countryName on the payload (use first item; all items share context)
    const first = items[0] || {};
    if (!first.timezone || String(first.timezone).trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          message: "timezone is required and cannot be empty",
          code: "MISSING_TIMEZONE",
        },
      });
    }

    if (!first.countryName || String(first.countryName).trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          message: "countryName is required and cannot be empty",
          code: "MISSING_COUNTRY_NAME",
        },
      });
    }

    // 🎯 PRE-CHECK (main org only): For each item, search main Contacts then main Leads by email. Only create Lead in main if not found in either. Do NOT search other org — otherwise an email that exists only in Charter would be treated as main-org lead and we'd use Charter Lead ID in main-org APIs (invalid).
    const preCheck = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = {
        contactId: null,
        leadId: null,
        leadSource: null,
        duplicateLeadInfoEntry: null,
        existingContactInfoEntry: null,
      };
      try {
        let foundContact = null;
        try {
          const contactResult = await crmSearchByEmail({
            org: "main",
            module: "Contacts",
            email: item.email,
          });
          if (contactResult.found && contactResult.rows.length > 0)
            foundContact = contactResult.rows[0];
        } catch (e) {
          console.error(`❌ Pre-check Contacts for ${item.email}:`, e.message);
        }
        if (foundContact) {
          entry.contactId = foundContact.id;
          entry.existingContactInfoEntry = {
            email: item.email,
            existingContactId: foundContact.id,
            firstName: foundContact.First_Name || foundContact.first_name,
            lastName: foundContact.Last_Name || foundContact.last_name,
            foundInOrg: "main",
          };
        } else {
          try {
            const leadResult = await crmSearchByEmail({
              org: "main",
              module: "Leads",
              email: item.email,
            });
            if (leadResult.found && leadResult.rows.length > 0) {
              const foundLead = leadResult.rows[0];
              entry.leadId = foundLead.id;
              entry.leadSource = "existing";
              entry.duplicateLeadInfoEntry = {
                email: item.email,
                existingLeadId: foundLead.id,
                firstName: foundLead.First_Name || foundLead.first_name,
                lastName: foundLead.Last_Name || foundLead.last_name,
                foundInOrg: "main",
              };
            }
          } catch (e) {
            console.error(
              `❌ Pre-check Leads (main) for ${item.email}:`,
              e.message
            );
          }
        }
      } catch (err) {
        console.error(`❌ Pre-check error for item ${i}:`, err);
      }
      preCheck.push(entry);
    }

    const newLeadIndices = preCheck
      .map((e, idx) => (e.contactId || e.leadId ? -1 : idx))
      .filter((i) => i >= 0);

    const mapped = [];
    for (const idx of newLeadIndices) {
      const item = items[idx];
      const mappedItem = await mapLead(
        item,
        boatShowName,
        sunreefYachtCampaignId
      );
      // Main org: search tour given by in main CRM; if found use their ID, else fallback to Default Sunreef User ID
      const hasTourGivenByName = !!(item.Tour_Given_By ?? item.tourGivenBy);
      if (hasTourGivenByName) {
        try {
          const userId = await findUserIdByName("main", mappedItem.Owner);
          mappedItem.Owner =
            userId || item.defaultSunreefUserId || DEFAULT_USER_MAIN;
        } catch (error) {
          console.error(
            `❌ Error finding user for "${item.tourGivenBy}":`,
            error
          );
          mappedItem.Owner = item.defaultSunreefUserId || DEFAULT_USER_MAIN;
        }
      } else {
        mappedItem.Owner = item.defaultSunreefUserId || DEFAULT_USER_MAIN;
      }
      mapped.push(mappedItem);
    }

    // If any record lacks Last_Name, fail early with which index is bad
    const missingIdx = mapped.findIndex((r) => !r.Last_Name);
    if (missingIdx !== -1) {
      return res.status(400).json({
        success: false,
        module: "Leads",
        error: {
          code: "MANDATORY_NOT_FOUND",
          details: { api_name: "Last_Name", index: missingIdx },
          message: "Last_Name is required",
        },
      });
    }

    // Send to MAIN org only for emails not found in Contacts or Leads (pre-check)
    let created = [];
    let leadCreateSuccess = true;
    let leadCreateZres = null;
    if (mapped.length > 0) {
      const cfg = getOrgConfig("main");
      const token = await getTokenManager("main").get();
      const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads`;
      leadCreateZres = await axios.post(
        url,
        { data: mapped },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      const rows = leadCreateZres.data?.data || [];
      created = rows.map((r, j) => ({
        index: j,
        status: r.status,
        code: r.code,
        id: r.details?.id,
        details: r.details,
        message: r.message,
      }));
      leadCreateSuccess =
        leadCreateZres.status === 201 || leadCreateZres.status === 200;
      if (!leadCreateSuccess) {
        logZohoCrmApiError(
          "MAIN org — create Lead(s)",
          leadCreateZres.status,
          leadCreateZres.data,
          mapped.length === 1 ? mapped[0] : { data: mapped }
        );
      }
    }

    const meetingResults = [];
    const duplicateLeadInfo = preCheck
      .filter((e) => e.duplicateLeadInfoEntry)
      .map((e) => e.duplicateLeadInfoEntry);
    const existingContactInfo = preCheck
      .filter((e) => e.existingContactInfoEntry)
      .map((e) => e.existingContactInfoEntry);
    const newLeadInfo = [];
    for (let j = 0; j < created.length; j++) {
      const id = created[j].id;
      if (id && newLeadIndices[j] !== undefined) {
        const item = items[newLeadIndices[j]];
        newLeadInfo.push({
          email: item.email,
          newLeadId: id,
          firstName: item.firstName,
          lastName: item.lastName,
        });
      }
    }

    for (let i = 0; i < items.length; i++) {
      const originalItem = items[i];
      const pre = preCheck[i];
      const j = newLeadIndices.indexOf(i);
      const leadRecord = j >= 0 && created[j] ? created[j] : {};
      let leadId = pre.leadId || leadRecord.id || null;
      const leadSource = pre.leadSource || (leadRecord.id ? "new" : null);
      const contactId = pre.contactId || null;

      // 🎯 SECOND (Leads): Add lead to Campaigns + Trigger_WhatsApp when existing lead
      if (leadId) {
        try {
          await addLeadToCampaigns("main", leadId, originalItem);
        } catch (campaignError) {
          console.error(`❌ Error adding lead to Campaigns:`, campaignError);
        }
        if (leadSource === "existing") {
          try {
            await updateLeadTriggerWhatsApp("main", leadId, originalItem);
          } catch (updateError) {
            console.error(
              `❌ Error updating Lead Trigger_WhatsApp_Notification:`,
              updateError
            );
          }
        }
      }

      // 🎯 SECOND (Contacts): Update contact fields + Boat_Show_New + Event_Boat_Show (campaign)
      if (contactId) {
        try {
          await updateContactWithBoatShowAndCampaign(
            "main",
            contactId,
            originalItem,
            boatShowName,
            sunreefYachtCampaignId
          );
        } catch (contactUpdateError) {
          console.error(`❌ Error updating Contact:`, contactUpdateError);
        }
      }

      // 🎯 THIRD: Create meeting (linked to lead or contact) if we have required data
      if (
        originalItem.tourGivenBy &&
        originalItem.fromDate &&
        originalItem.fromTime &&
        originalItem.toTime
      ) {
        try {
          // Main org meeting: search tour given by in main CRM; if found use their ID, else Default Sunreef User ID
          let ownerId = await findUserIdByName(
            "main",
            originalItem.tourGivenBy
          );
          if (!ownerId)
            ownerId = originalItem.defaultSunreefUserId || DEFAULT_USER_MAIN;
          if (!ownerId) ownerId = DEFAULT_USER_MAIN;
          if (ownerId) {
            const timezoneOffset = getTimezoneOffset(originalItem.timezone);
            const startTime =
              normalizeTimeForZoho(originalItem.fromTime) ||
              originalItem.fromTime;
            const endTime =
              normalizeTimeForZoho(originalItem.toTime) || originalItem.toTime;
            const startDateTime = `${originalItem.fromDate}T${startTime}:00${timezoneOffset}`;
            const endDateTime = `${originalItem.fromDate}T${endTime}:00${timezoneOffset}`;
            const firstName =
              originalItem.First_Name ?? originalItem.firstName ?? "";
            const lastName =
              originalItem.Last_Name ?? originalItem.lastName ?? "";
            const fullName = `${firstName} ${lastName}`.trim();
            const meetingData = {
              title: `${boatShowName} - Meeting - ${fullName}`,
              venue: "Client location",
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              leadId: leadId || undefined,
              contactId: contactId || undefined,
              ownerId: ownerId,
              boatShowName: boatShowName,
              description: `Meeting at ${boatShowName} Boat show with ${fullName}`,
            };
            const meetingResult = await createMeetingInCRM("main", meetingData);
            meetingResults.push({
              leadId: leadId || null,
              contactId: contactId || null,
              leadSource: leadSource,
              meeting: meetingResult,
            });
          } else {
            console.warn(
              `⚠️ Could not find user ID for tour given by: ${originalItem.tourGivenBy}`
            );
            meetingResults.push({
              leadId: leadId || null,
              contactId: contactId || null,
              leadSource: leadSource,
              meeting: {
                success: false,
                message: `Could not find user ID for tour given by: ${originalItem.tourGivenBy}`,
              },
            });
          }
        } catch (meetingError) {
          console.error(`❌ Error creating meeting:`, meetingError);
          meetingResults.push({
            leadId: leadId || null,
            contactId: contactId || null,
            leadSource: leadSource,
            meeting: {
              success: false,
              message: `Meeting creation failed: ${meetingError.message}`,
            },
          });
        }
      } else {
        meetingResults.push({
          leadId: leadId || null,
          contactId: contactId || null,
          leadSource: leadSource,
          meeting: {
            success: false,
            message:
              "Missing required meeting data (tourGivenBy, fromDate, fromTime, toTime)",
          },
        });
      }
    }

    // 🎯 OTHER ORG: Create leads in OTHER org for Charter purpose
    const otherOrgResults = [];
    for (let i = 0; i < items.length; i++) {
      const originalItem = items[i];
      const tourGivenBy =
        originalItem.tourGivenBy || originalItem.Tour_Given_By;
      const purpose = originalItem.hereFor || originalItem.Are_you_here_for;
      const interestedCharter =
        originalItem.interestedCharter === true ||
        (originalItem.Interested_in_Charter &&
          String(originalItem.Interested_in_Charter).toLowerCase() === "yes");
      const crmOrg = (
        originalItem.tourGivenByCrmOrganization ||
        originalItem.CRM_Organization ||
        originalItem.crm_organization ||
        ""
      ).trim();
      const isRepSunreefCharter = crmOrg === "Sunreef Charter";

      // Create in Charter/OTHER org when: purpose = Charter OR Pre Owned OR Interested in Charter = Yes OR tour guide's CRM_Organization = "Sunreef Charter"
      const isCharterPurpose =
        purpose === "charter" ||
        purpose === "pre-owned" ||
        interestedCharter ||
        isRepSunreefCharter;

      if (isCharterPurpose) {
        try {
          const otherOrgMappedItem = await mapLead(
            originalItem,
            boatShowName,
            sunreefYachtCampaignId
          );

          // Other org: search tour given by in other CRM; if found use their ID, else fallback to Default Charter User ID
          const hasTourGivenByNameOther = !!tourGivenBy;
          let assignedToDefaultCharterUser = false;

          if (hasTourGivenByNameOther) {
            try {
              const userId = await findUserIdByName("other", tourGivenBy);

              if (userId) {
                otherOrgMappedItem.Owner = userId;
              } else {
                otherOrgMappedItem.Owner =
                  originalItem.defaultCharterUserId || DEFAULT_USER_OTHER;
                assignedToDefaultCharterUser = true;
              }
            } catch (error) {
              console.error(
                `❌ Error finding user for "${tourGivenBy}" in OTHER org:`,
                error?.message || error
              );
              otherOrgMappedItem.Owner =
                originalItem.defaultCharterUserId || DEFAULT_USER_OTHER;
              assignedToDefaultCharterUser = true;
            }
          } else {
            otherOrgMappedItem.Owner =
              originalItem.defaultCharterUserId || DEFAULT_USER_OTHER;
            assignedToDefaultCharterUser = true;
          }

          // Validate required fields for OTHER org
          if (!otherOrgMappedItem.Last_Name) {
            throw new Error(
              "Last_Name is required for OTHER org lead creation"
            );
          }
          if (!otherOrgMappedItem.Owner) {
            throw new Error("Owner is required for OTHER org lead creation");
          }
          if (!otherOrgMappedItem.Preferred_Language) {
            throw new Error(
              "Preferred_Language is required for OTHER org lead creation"
            );
          }
          if (!otherOrgMappedItem.Lead_Source) {
            throw new Error(
              "Lead_Source is required for OTHER org lead creation"
            );
          }

          // 🎯 PRE-CHECK OTHER ORG: Search Contacts then Leads by email before creating
          const charterEmail =
            otherOrgMappedItem.Email ||
            originalItem.email ||
            originalItem.Email;
          let otherExistingContactId = null;
          let otherExistingLeadId = null;
          if (charterEmail) {
            try {
              const otherContactResult = await crmSearchByEmail({
                org: "other",
                module: "Contacts",
                email: charterEmail,
              });
              if (
                otherContactResult.found &&
                otherContactResult.rows.length > 0
              ) {
                otherExistingContactId = otherContactResult.rows[0].id;
              }
            } catch (e) {
              console.error(
                `❌ Charter pre-check Contacts for ${charterEmail}:`,
                e.message
              );
            }
            if (!otherExistingContactId) {
              try {
                const otherLeadResult = await crmSearchByEmail({
                  org: "other",
                  module: "Leads",
                  email: charterEmail,
                });
                if (otherLeadResult.found && otherLeadResult.rows.length > 0) {
                  otherExistingLeadId = otherLeadResult.rows[0].id;
                }
              } catch (e) {
                console.error(
                  `❌ Charter pre-check Leads for ${charterEmail}:`,
                  e.message
                );
              }
            }
          }

          const charterEmailAlreadyExists = !!(
            otherExistingContactId || otherExistingLeadId
          );
          const existingCharterRecordId =
            otherExistingContactId || otherExistingLeadId;
          const existingCharterModule = otherExistingContactId
            ? "Contacts"
            : otherExistingLeadId
            ? "Leads"
            : null;

          let otherLeadId = null;
          let otherLeadSource = "new";

          if (charterEmailAlreadyExists) {
            otherLeadId = existingCharterRecordId;
            otherLeadSource = "existing";

            if (existingCharterModule === "Leads" && otherLeadId) {
              try {
                await addLeadToCampaigns("other", otherLeadId, originalItem);
              } catch (e) {
                console.error(
                  `❌ Error adding existing Charter lead to Campaigns:`,
                  e.message
                );
              }
              try {
                await updateLeadTriggerWhatsApp(
                  "other",
                  otherLeadId,
                  originalItem
                );
              } catch (e) {
                console.error(
                  `❌ Error updating existing Charter Lead stand fields:`,
                  e.message
                );
              }
            }
            if (existingCharterModule === "Contacts" && otherLeadId) {
              if (charterCampaignId) {
                try {
                  await updateContactCampaign(
                    "other",
                    otherLeadId,
                    charterCampaignId
                  );
                } catch (e) {
                  console.error(
                    `❌ Error linking Charter campaign to existing Contact:`,
                    e.message
                  );
                }
              }
              try {
                await updateContactWithBoatShowAndCampaign(
                  "other",
                  otherLeadId,
                  originalItem,
                  boatShowName,
                  charterCampaignId
                );
              } catch (e) {
                console.error(
                  `❌ Error updating existing Charter Contact stand fields:`,
                  e.message
                );
              }
            }
          } else {
            // Email not found → create lead in OTHER org
            const otherCfg = getOrgConfig("other");

            const otherToken = await getTokenManager("other").get();
            const otherUrl = `${otherCfg.ZOHO_CRM_BASE_URL}/Leads`;

            if (!otherToken) {
              throw new Error("OTHER org access token is missing or invalid");
            }

            const otherOrgLead = {
              First_Name: otherOrgMappedItem.First_Name,
              Last_Name: otherOrgMappedItem.Last_Name,
              Mobile: otherOrgMappedItem.Mobile,
              Email: otherOrgMappedItem.Email,
              Preferred_Language:
                otherOrgMappedItem.Preferred_Language || "English",
              Lead_Source: "Boat Show/ Sunreef Events",
              Lead_Status: "new",
              Further_Source: "Boat Show/ Events",
              Country_Name: otherOrgMappedItem.Countries,
              State: otherOrgMappedItem.State,
              City: otherOrgMappedItem.City,
              Zip_Code: otherOrgMappedItem.Postal_Code,
              Campaign: charterCampaignId,
              Owner: otherOrgMappedItem.Owner,
              Description: otherOrgMappedItem.Description,
              Boat_Show_Port: otherOrgMappedItem.Boat_Show_Port || undefined,
              // Sales rep / meeting fields
              Tour_Given_By1: otherOrgMappedItem.Tour_Given_By1 ?? undefined,
              Tour_Given_By_Mobile:
                otherOrgMappedItem.Tour_Given_By_Mobile ?? undefined,
              Boat_Show_Stand_Meeting_Date:
                otherOrgMappedItem.Boat_Show_Stand_Meeting_Date ?? undefined,
              Boat_Show_Stand_Meeting_Time:
                otherOrgMappedItem.Boat_Show_Stand_Meeting_Time ?? undefined,
              Boat_Show_Stand_Interested_Yacht:
                otherOrgMappedItem.Boat_Show_Stand_Interested_Yacht ||
                "Not Sure",
              AI_Enriched_Profile_Summary:
                otherOrgMappedItem.AI_Enriched_Profile_Summary || undefined,
              AI_Lead_Score: otherOrgMappedItem.AI_Lead_Score || undefined,
              AI_Wealth_Category:
                otherOrgMappedItem.AI_Wealth_Category || undefined,
              Enrich_Count: otherOrgMappedItem.Enrich_Count || undefined,
            };

            const otherZres = await axios.post(
              otherUrl,
              { data: [otherOrgLead] },
              {
                headers: {
                  Authorization: `Zoho-oauthtoken ${otherToken}`,
                  "Content-Type": "application/json",
                },
                validateStatus: () => true,
              }
            );

            const otherOk =
              otherZres.status === 201 || otherZres.status === 200;
            const otherRows = otherZres.data?.data || [];

            if (otherOk && otherRows.length > 0) {
              otherLeadId = otherRows[0].details?.id;
              try {
                await addLeadToCampaigns("other", otherLeadId, originalItem);
              } catch (otherCampaignError) {
                console.error(
                  `❌ Error adding lead to Campaigns in OTHER org:`,
                  otherCampaignError
                );
              }
            } else {
              logZohoCrmApiError(
                "Charter / OTHER org — create Lead (full payload failed)",
                otherZres.status,
                otherZres.data,
                otherOrgLead
              );
              try {
                const fallbackLead = {
                  First_Name: otherOrgMappedItem.First_Name,
                  Last_Name: otherOrgMappedItem.Last_Name,
                  Email: otherOrgMappedItem.Email,
                  Owner: otherOrgMappedItem.Owner,
                };
                const fallbackRes = await axios.post(
                  otherUrl,
                  { data: [fallbackLead] },
                  {
                    headers: {
                      Authorization: `Zoho-oauthtoken ${otherToken}`,
                      "Content-Type": "application/json",
                    },
                    validateStatus: () => true,
                  }
                );
                if (
                  (fallbackRes.status === 201 || fallbackRes.status === 200) &&
                  fallbackRes.data?.data?.length > 0
                ) {
                  otherLeadId = fallbackRes.data.data[0].details?.id;
                } else {
                  logZohoCrmApiError(
                    "Charter / OTHER org — create Lead (fallback minimal payload also failed)",
                    fallbackRes.status,
                    fallbackRes.data,
                    fallbackLead
                  );
                }
              } catch (fallbackError) {
                console.error(
                  `❌ Fallback POST error:`,
                  fallbackError?.message,
                  fallbackError?.response?.data
                );
              }
            }
          } // end of: else (email not found → create lead)

          // Create meeting in OTHER org (linked to new lead, existing lead, or existing contact)
          if (
            otherLeadId &&
            originalItem.fromDate &&
            originalItem.fromTime &&
            originalItem.toTime
          ) {
            try {
              const timezoneOffset = getTimezoneOffset(originalItem.timezone);
              const startTime =
                normalizeTimeForZoho(originalItem.fromTime) ||
                originalItem.fromTime;
              const endTime =
                normalizeTimeForZoho(originalItem.toTime) ||
                originalItem.toTime;
              const startDateTime = `${originalItem.fromDate}T${startTime}:00${timezoneOffset}`;
              const endDateTime = `${originalItem.fromDate}T${endTime}:00${timezoneOffset}`;
              const meetingOwnerId = otherOrgMappedItem.Owner;
              const otherFirstName =
                originalItem.First_Name ?? originalItem.firstName ?? "";
              const otherLastName =
                originalItem.Last_Name ?? originalItem.lastName ?? "";
              const otherFullName = `${otherFirstName} ${otherLastName}`.trim();

              const otherMeetingData = {
                title: `${boatShowName} - Meeting - ${otherFullName}`,
                venue: "Client location",
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                ownerId: meetingOwnerId,
                leadId:
                  existingCharterModule !== "Contacts"
                    ? otherLeadId
                    : undefined,
                contactId:
                  existingCharterModule === "Contacts"
                    ? otherLeadId
                    : undefined,
                boatShowName: boatShowName,
                description: `Meeting at ${boatShowName} Boat show with ${otherFullName}`,
              };

              const otherMeetingResult = await createMeetingInCRM(
                "other",
                otherMeetingData
              );

              otherOrgResults.push({
                index: i,
                tourGuide: tourGivenBy,
                assignedToDefaultCharterUser: assignedToDefaultCharterUser,
                leadId: otherLeadId,
                leadSource: otherLeadSource,
                existingModule: existingCharterModule,
                meetingId: otherMeetingResult.meetingId,
                success: true,
                message: charterEmailAlreadyExists
                  ? `Existing ${existingCharterModule} found in Charter org; meeting created`
                  : "Lead and meeting created successfully in Charter org",
              });
            } catch (otherMeetingError) {
              console.error(
                `❌ Error creating meeting in OTHER org:`,
                otherMeetingError
              );
              otherOrgResults.push({
                index: i,
                tourGuide: tourGivenBy,
                assignedToDefaultCharterUser: assignedToDefaultCharterUser,
                leadId: otherLeadId,
                leadSource: otherLeadSource,
                existingModule: existingCharterModule,
                meetingId: null,
                success: !!otherLeadId,
                message: otherLeadId
                  ? "Lead/Contact found but meeting creation failed"
                  : "Failed in Charter org",
              });
            }
          } else if (otherLeadId) {
            otherOrgResults.push({
              index: i,
              tourGuide: tourGivenBy,
              assignedToDefaultCharterUser: assignedToDefaultCharterUser,
              leadId: otherLeadId,
              leadSource: otherLeadSource,
              existingModule: existingCharterModule,
              meetingId: null,
              success: true,
              message: charterEmailAlreadyExists
                ? `Existing ${existingCharterModule} found in Charter org (no meeting - missing time data)`
                : "Lead created in Charter org (no meeting - missing time data)",
            });
          } else {
            otherOrgResults.push({
              index: i,
              tourGuide: tourGivenBy,
              assignedToDefaultCharterUser: assignedToDefaultCharterUser,
              leadId: null,
              leadSource: null,
              existingModule: null,
              meetingId: null,
              success: false,
              message: "Failed to create or find lead in Charter org",
            });
          }
        } catch (otherOrgError) {
          console.error(
            `❌ Error processing OTHER org for tour guide ${tourGivenBy}:`,
            otherOrgError
          );
          otherOrgResults.push({
            index: i,
            tourGuide: tourGivenBy,
            assignedToDefaultCharterUser: false,
            leadId: null,
            leadSource: null,
            existingModule: null,
            meetingId: null,
            success: false,
            message: `Error: ${otherOrgError.message}`,
          });
        }
      } else {
      }
    }

    // Summary log

    if (leadCreateSuccess) {
      return res.status(201).json({
        success: true,
        module: "Leads",
        count: created.length,
        records: created,
        meetings: meetingResults,
        duplicateLeadInfo: duplicateLeadInfo,
        newLeadInfo: newLeadInfo,
        existingContactInfo: existingContactInfo,
        otherOrgResults: otherOrgResults,
      });
    }

    return res.status(leadCreateZres ? leadCreateZres.status : 500).json({
      success: false,
      module: "Leads",
      error: leadCreateZres
        ? leadCreateZres.data
        : { message: "Lead creation failed" },
      meetings: meetingResults,
      duplicateLeadInfo: duplicateLeadInfo,
      newLeadInfo: newLeadInfo,
      existingContactInfo: existingContactInfo,
      otherOrgResults: otherOrgResults,
    });
  } catch (error) {
    console.error(
      "Error in /api/leads:",
      error?.response?.data || error.message
    );
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      code: "INTERNAL_ERROR",
      message: error.message || "Internal error",
    };
    res
      .status(status)
      .json({ success: false, module: "Leads", error: payload });
  }
});

/* ===== CRM: search by email (Leads, default org=main) ===== */
// scopes needed on your OAuth client:
// ZohoCRM.modules.leads.READ  AND  ZohoSearch.securesearch.READ
function isLikelyEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

async function crmSearchByEmail({ org = "main", module = "Leads", email }) {
  if (!isLikelyEmail(email)) {
    const err = new Error("Invalid email");
    err.status = 400;
    throw err;
  }
  const cfg = getOrgConfig(org);
  const token = await getTokenManager(org).get();

  const url = `${cfg.ZOHO_CRM_BASE_URL}/${encodeURIComponent(module)}/search`;
  const params = new URLSearchParams({ email: email.trim() });

  const resp = await axios.get(`${url}?${params.toString()}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    validateStatus: () => true,
  });

  // Zoho may return 200 with data, 204 when nothing found, or 4xx on errors
  if (resp.status === 200) {
    const rows = Array.isArray(resp.data?.data) ? resp.data.data : [];
    return { found: rows.length > 0, status: 200, rows };
  }
  if (resp.status === 204) {
    return { found: false, status: 204, rows: [] };
  }

  // bubble up Zoho errors with detail
  const e = new Error("CRM search failed");
  e.status = resp.status;
  e.body = resp.data;
  throw e;
}

/* GET /api/crm/search-email?email=foo@bar.com[&module=Leads][&org=both] */
app.get("/api/crm/search-email", async (req, res) => {
  try {
    const email = String(req.query.email || "");
    const module = String(req.query.module || "Leads");
    const org = String(req.query.org || "both").toLowerCase();
    const searchContactsIfNotInLeads =
      String(req.query.search_contacts_if_not_in_leads || "").toLowerCase() ===
      "true";

    if (!email || !isLikelyEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { message: "Valid email address is required" },
      });
    }

    const enabledOrgs = Object.keys(ORGS).filter(
      (k) => !!ORGS[k].REFRESH_TOKEN
    );
    const bothAvailable =
      enabledOrgs.includes("main") && enabledOrgs.includes("other");
    let targetOrgs = [];
    if (org === "both" && bothAvailable) {
      targetOrgs = ["main", "other"];
    } else if (org === "main" || org === "other") {
      targetOrgs = [org];
    } else if (bothAvailable) {
      targetOrgs = ["main", "other"];
    } else {
      targetOrgs = [enabledOrgs[0] || "main"];
    }

    // Search in all target orgs (Leads)
    const searchPromises = targetOrgs.map(async (orgKey) => {
      try {
        const result = await crmSearchByEmail({ org: orgKey, module, email });
        return {
          org: orgKey,
          success: true,
          found: result.found,
          count: result.rows.length,
          data: result.rows,
        };
      } catch (error) {
        console.error(`❌ Error searching in ${orgKey} org:`, error.message);
        return {
          org: orgKey,
          success: false,
          error: error.message,
          found: false,
          count: 0,
          data: [],
        };
      }
    });

    const results = await Promise.all(searchPromises);
    const combinedData = [];
    let totalFound = 0;
    let anyFound = false;

    results.forEach((result) => {
      if (result.success && result.found) {
        anyFound = true;
        totalFound += result.count;
        result.data.forEach((record) => {
          combinedData.push({
            ...record,
            _org: result.org,
            _module: "Leads",
          });
        });
      }
    });

    // If no Leads found and requested, search Contacts in all target orgs
    if (!anyFound && searchContactsIfNotInLeads && module === "Leads") {
      const contactPromises = targetOrgs.map(async (orgKey) => {
        try {
          const contactResult = await crmSearchByEmail({
            org: orgKey,
            module: "Contacts",
            email,
          });
          return { org: orgKey, result: contactResult };
        } catch (contactErr) {
          console.error(
            `❌ Error searching Contacts in ${orgKey} org:`,
            contactErr.message
          );
          return { org: orgKey, result: { found: false, rows: [] } };
        }
      });

      const contactResults = await Promise.all(contactPromises);
      contactResults.forEach(({ org: orgKey, result: contactResult }) => {
        if (contactResult.found && contactResult.rows.length > 0) {
          anyFound = true;
          totalFound += contactResult.rows.length;
          contactResult.rows.forEach((record) => {
            combinedData.push({
              ...record,
              _org: orgKey,
              _module: "Contacts",
            });
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      module,
      email,
      orgs_searched: targetOrgs,
      results_by_org: results,
      exists: anyFound,
      total_count: totalFound,
      data: combinedData,
    });
  } catch (err) {
    console.error("Error in /api/crm/search-email:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: err.body || { message: err.message || "Internal error" },
    });
  }
});

/* GET /api/crm/check-duplicate-email?email=foo@bar.com - Check email in both orgs */
app.get("/api/crm/check-duplicate-email", async (req, res) => {
  try {
    const email = String(req.query.email || "");

    if (!email || !isLikelyEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { message: "Valid email address is required" },
      });
    }

    // Check both orgs
    const enabledOrgs = Object.keys(ORGS).filter(
      (k) => !!ORGS[k].REFRESH_TOKEN
    );
    const bothAvailable =
      enabledOrgs.includes("main") && enabledOrgs.includes("other");
    const searchOrgs = bothAvailable ? ["main", "other"] : ["main"];

    const searchPromises = searchOrgs.map(async (orgKey) => {
      try {
        const result = await crmSearchByEmail({
          org: orgKey,
          module: "Leads",
          email: email,
        });

        return {
          org: orgKey,
          success: true,
          found: result.found,
          count: result.rows.length,
          data: result.rows,
        };
      } catch (error) {
        console.error(
          `❌ Error checking email in ${orgKey} org:`,
          error.message
        );
        return {
          org: orgKey,
          success: false,
          error: error.message,
          found: false,
          count: 0,
          data: [],
        };
      }
    });

    const results = await Promise.all(searchPromises);

    // Check if email exists in any org
    const existsInAnyOrg = results.some(
      (result) => result.success && result.found
    );
    const totalCount = results.reduce(
      (sum, result) => sum + (result.count || 0),
      0
    );

    // Get the first found record for display
    const firstFoundRecord = results.find(
      (result) => result.success && result.found && result.data.length > 0
    );
    const displayRecord = firstFoundRecord ? firstFoundRecord.data[0] : null;

    res.status(200).json({
      success: true,
      email,
      exists: existsInAnyOrg,
      total_count: totalCount,
      results_by_org: results,
      display_record: displayRecord
        ? {
            id: displayRecord.id,
            first_name: displayRecord.First_Name || displayRecord.first_name,
            last_name: displayRecord.Last_Name || displayRecord.last_name,
            email: displayRecord.Email || displayRecord.email,
            org: firstFoundRecord.org,
          }
        : null,
    });
  } catch (err) {
    console.error("Error in /api/crm/check-duplicate-email:", err);
    res.status(500).json({
      success: false,
      error: { message: err.message || "Internal error" },
    });
  }
});

// ===== CRM: Fetch Users (name + id) =====
async function fetchUsersForOrg(
  orgKey,
  { type = "AllUsers", per_page = 200, maxPages = Infinity } = {}
) {
  const cfg = getOrgConfig(orgKey);
  const token = await getTokenManager(orgKey).get();

  const out = [];
  let page = 1,
    pages = 0,
    hasMore = true;

  while (hasMore && pages < maxPages) {
    const params = new URLSearchParams({
      type, // e.g. AllUsers | ActiveUsers | AdminUsers
      per_page: String(per_page),
      page: String(page),
    });

    const url = `${cfg.ZOHO_CRM_BASE_URL}/users?${params.toString()}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      const body = res.data;
      throw Object.assign(new Error(`[${orgKey}] Users fetch failed`), {
        status: res.status,
        code: body?.code,
        body,
      });
    }

    const rows = res.data?.users || [];
    for (const u of rows) {
      out.push({
        id: u.id,
        name:
          u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        email: u.email,
        status: u.status,
        role: u.role?.name || null,
        profile: u.profile?.name || null,
      });
    }

    // pagination
    hasMore = rows.length === per_page;
    page += 1;
    pages += 1;
  }

  return { success: true, org: orgKey, count: out.length, data: out };
}
// GET /api/crm/users?org=main&type=AllUsers
app.get("/api/crm/users", async (req, res) => {
  try {
    const org = String(req.query.org || "main").toLowerCase();
    const type = req.query.type || "AllUsers"; // ActiveUsers, AdminUsers etc.
    const per_page = req.query.per_page
      ? parseInt(req.query.per_page, 10)
      : 200;
    const maxPages = req.query.maxPages
      ? parseInt(req.query.maxPages, 10)
      : Infinity;

    const result = await fetchUsersForOrg(org, { type, per_page, maxPages });
    res.json(result);
  } catch (err) {
    console.error("Error in /api/crm/users:", err?.body || err.message);
    const status = err?.status || 500;
    res.status(status).json({
      success: false,
      error: err?.body || { message: err.message || "Internal error" },
    });
  }
});

function fmtCreatorDateTime(dtLike) {
  if (!dtLike) return null;
  const d = new Date(dtLike);
  if (Number.isNaN(+d)) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const MMM = d.toLocaleString("en-US", { month: "short" });
  const yyyy = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}-${MMM}-${yyyy} ${HH}:${mm}:${ss}`;
}

/** Handle separate date/time pieces from the UI (e.g., FromDate + FromTime) */
function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr && !timeStr) return null;
  // If dateStr already includes time → just format
  if (dateStr && /\d{1,2}:\d{2}/.test(String(dateStr)))
    return fmtCreatorDateTime(dateStr);
  // Otherwise, combine in local time
  const date = dateStr ? new Date(dateStr) : new Date();
  const [h, m] = (timeStr || "00:00").split(":").map((n) => parseInt(n, 10));
  date.setHours(h || 0, m || 0, 0, 0);
  return fmtCreatorDateTime(date);
}

function mapToCreatorRecord(
  input = {},
  duplicateLeadInfo = [],
  newLeadInfo = [],
  existingContactInfo = []
) {
  // consent checkboxes: coerce to true/false
  const asBool = (v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const s = String(v || "")
      .trim()
      .toLowerCase();
    return ["true", "yes", "1", "on", "checked"].includes(s);
  };

  // Support both "From" / "To" as full datetimes OR "fromDate+fromTime"
  const fromDT =
    input.From || combineDateAndTime(input.fromDate, input.fromTime);
  const toDT = input.To || combineDateAndTime(input.fromDate, input.toTime); // Use fromDate for toDate

  // Build Description exactly like CRM
  const buildDescription = () => {
    const parts = [];
    if (input.boatShowName) {
      parts.push(`Boat Show : ${input.boatShowName}`);
    }
    if (input.fromDate && input.fromTime && input.toTime) {
      parts.push(
        `From: ${input.fromDate} ${input.fromTime} To: ${input.fromDate} ${input.toTime}`
      );
    }
    const purpose = input.Are_you_here_for ?? input.hereFor;
    if (purpose) {
      parts.push(`Please tell us the purpose of your visit: ${purpose}`);
    }
    const notes = input.Additional_notes ?? input.notes;
    if (notes) {
      parts.push(`Notes: ${notes}`);
    }
    return parts.join("\n");
  };
  const description = buildDescription();

  // If your UI shows a “Current Date & Time (Dubai)”, pass it if available; else fill now.
  const nowForCreator = fmtCreatorDateTime(input.Date_Time || new Date());

  return {
    First_Name: input.First_Name ?? input.firstName,
    Last_Name: input.Last_Name ?? input.lastName,
    Mobile_Number: input.Mobile_Number ?? input.mobile ?? input.Mobile,
    Email: input.Email ?? input.email,

    Date_Time: nowForCreator,
    Status: (() => {
      const email = input.Email || input.email;

      // Contact already in CRM: no Lead is created, we only update the
      // Contact and link the meeting to it.
      const contactInfo = existingContactInfo.find(
        (info) => info.email === email
      );
      if (contactInfo) {
        return `Contact already exists in CRM (${contactInfo.existingContactId})`;
      }

      // Check if this email has duplicate lead info
      const duplicateInfo = duplicateLeadInfo.find(
        (info) => info.email === email
      );
      if (duplicateInfo) {
        return `Lead already created in CRM (${duplicateInfo.existingLeadId})`;
      }

      // Check if this email has new lead info
      const newInfo = newLeadInfo.find((info) => info.email === email);
      if (newInfo) {
        return `new (${newInfo.newLeadId})`;
      }

      return input.Status ?? "new";
    })(),
    Existing_Lead_ID: (() => {
      // Check if this email has duplicate lead info
      const duplicateInfo = duplicateLeadInfo.find(
        (info) => info.email === (input.Email || input.email)
      );
      return duplicateInfo ? duplicateInfo.existingLeadId : null;
    })(),

    City_District: input.City_District ?? input.city,
    State_Province: input.State_Province ?? input.state,
    Country: getCountryName(input.Country ?? input.country), // Convert country code to full name
    Postal_Code: input.Postal_Code ?? input.postal,

    Are_you_here_for: input.Are_you_here_for ?? input.hereFor,

    I_m_interested_in_Charter:
      input.I_m_interested_in_Charter ??
      (typeof input.interestedCharter !== "undefined"
        ? asBool(input.interestedCharter)
          ? "Yes"
          : "No"
        : undefined),

    Current_Boat_Owner:
      input.Current_Boat_Owner ??
      (typeof input.currentOwner !== "undefined"
        ? asBool(input.currentOwner)
          ? "Yes"
          : "No"
        : undefined),

    Are_you_a_Broker_or_referring_to_a_Brokerage_company:
      input.Are_you_a_Broker_or_referring_to_a_Brokerage_company ??
      (typeof input.isBroker !== "undefined"
        ? asBool(input.isBroker)
          ? "Yes"
          : "No"
        : undefined),

    Model_Interested_In: input.Model_Interested_In ?? input.modelInterested,
    Boat_Type_Power_Sail_Brand_Model_Length:
      input.Boat_Type_Power_Sail_Brand_Model_Length ?? input.boatType,

    How_much_are_you_willing_to_allocate_to_this_asset:
      input.How_much_are_you_willing_to_allocate_to_this_asset ??
      input.budgetAllocation ??
      input.budgetRange ??
      input.budget,

    How_soon_are_you_planning_to_buy_a_Yacht:
      input.How_soon_are_you_planning_to_buy_a_Yacht ??
      input.purchaseTimeline ??
      input.yachtPurchaseTimeline,

    I_agree_for_receiving_commercial_information_concerning_products_and_services_of_SUNREEF_VENTURE_S:
      typeof input.I_agree_for_receiving_commercial_information_concerning_products_and_services_of_SUNREEF_VENTURE_S !==
      "undefined"
        ? asBool(
            input.I_agree_for_receiving_commercial_information_concerning_products_and_services_of_SUNREEF_VENTURE_S
          )
        : typeof input.commercial !== "undefined"
        ? asBool(input.commercial)
        : undefined,

    I_agree_for_the_marketing_purposes_of_products_and_services_of_SUNREEF_VENTURE_S_A_and_their_partn:
      typeof input.I_agree_for_the_marketing_purposes_of_products_and_services_of_SUNREEF_VENTURE_S_A_and_their_partn !==
      "undefined"
        ? asBool(
            input.I_agree_for_the_marketing_purposes_of_products_and_services_of_SUNREEF_VENTURE_S_A_and_their_partn
          )
        : typeof input.marketing !== "undefined"
        ? asBool(input.marketing)
        : undefined,

    Tour_Given_By: input.Tour_Given_By ?? input.tourGivenBy,
    // Stand Location — the form sends it as boatShowPort (CRM calls it
    // Boat_Show_Port); Creator stores it as Stand_Location.
    Stand_Location:
      input.Stand_Location ??
      input.boatShowPort ??
      input.Boat_Show_Port ??
      undefined,
    // Per requirement: store the composed description in Creator Notes field
    Notes: description,

    From: fromDT ? fmtCreatorDateTime(fromDT) : null,
    To: toDT ? fmtCreatorDateTime(toDT) : null,
  };
}

/** Basic required validation — extend if you decide to lock more fields */
function validateCreatorRecord(rec) {
  const must = ["First_Name", "Last_Name", "Mobile_Number", "Email"];
  const missing = must.filter((k) => !rec[k] || String(rec[k]).trim() === "");
  return { ok: missing.length === 0, missing };
}

/** POST /api/creator/leads  — create single or bulk records in Creator */
app.post("/api/creator/leads", async (req, res) => {
  try {
    if (!CREATOR_OWNER || !CREATOR_FORM) {
      return res
        .status(500)
        .json({ success: false, error: "CREATOR_OWNER/FORM not configured" });
    }

    // Get appName from query parameter
    const appName = req.query.appName ? String(req.query.appName) : undefined;
    if (!appName) {
      return res.status(400).json({
        success: false,
        error: { message: "appName parameter is required" },
      });
    }

    const token = await getTokenManager("main").get(); // reuse your main-org access token

    // Normalize input -> array
    const raw = req.body;
    let items = [];
    if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (Array.isArray(raw)) items = raw;
    else if (raw && typeof raw === "object") items = [raw];

    if (!items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Send an object or { data: [...] }" });
    }

    // Extract duplicate lead info if provided
    const duplicateLeadInfo = raw.duplicateLeadInfo || [];
    const newLeadInfo = raw.newLeadInfo || [];
    const existingContactInfo = raw.existingContactInfo || [];

    // 🛟 Safety net: the three arrays above are relayed by the frontend from the
    // /api/leads response. If an email arrives with no info at all (e.g. an older
    // frontend build that doesn't send existingContactInfo yet), look the Contact
    // up directly so Status is still accurate instead of a bare "new".
    for (const item of items) {
      const email = item.Email || item.email;
      if (!email) continue;
      const alreadyKnown =
        duplicateLeadInfo.some((i) => i.email === email) ||
        newLeadInfo.some((i) => i.email === email) ||
        existingContactInfo.some((i) => i.email === email);
      if (alreadyKnown) continue;
      try {
        const contactResult = await crmSearchByEmail({
          org: "main",
          module: "Contacts",
          email,
        });
        if (contactResult.found && contactResult.rows.length > 0) {
          const foundContact = contactResult.rows[0];
          existingContactInfo.push({
            email,
            existingContactId: foundContact.id,
            firstName: foundContact.First_Name || foundContact.first_name,
            lastName: foundContact.Last_Name || foundContact.last_name,
            foundInOrg: "main",
          });
        }
      } catch (e) {
        console.error(
          `❌ Creator Status contact lookup for ${email}:`,
          e.message
        );
      }
    }

    // Map + validate

    const mapped = items.map((item) =>
      mapToCreatorRecord(
        item,
        duplicateLeadInfo,
        newLeadInfo,
        existingContactInfo
      )
    );

    const badIdx = mapped.findIndex((r) => !validateCreatorRecord(r).ok);
    if (badIdx !== -1) {
      const miss = validateCreatorRecord(mapped[badIdx]).missing;
      return res.status(400).json({
        success: false,
        error: { code: "MANDATORY_NOT_FOUND", index: badIdx, missing: miss },
      });
    }

    // Build payload for Creator v2.1
    const payload = {
      data: mapped.length === 1 ? mapped[0] : mapped,
    };

    // Optional skip_workflow (env) OR allow override via query ?skip_workflow=all
    const skip = (req.query.skip_workflow || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const finalSkip = skip.length ? skip : CREATOR_SKIP_WORKFLOW;
    if (finalSkip.length) payload.skip_workflow = finalSkip;

    // You can request echo of certain fields + success message/redirect tasks
    payload.result = {
      fields: ["ID", "First_Name", "Last_Name", "Email"],
      message: true,
      tasks: false,
    };

    const url = `${CREATOR_DATA_BASE_URL}/${encodeURIComponent(
      CREATOR_OWNER
    )}/${encodeURIComponent(appName)}/form/${encodeURIComponent(CREATOR_FORM)}`;

    const headers = {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    };
    if (CREATOR_ENV) headers["environment"] = CREATOR_ENV;
    if (CREATOR_DEMO_USER) headers["demo_user_name"] = CREATOR_DEMO_USER;

    const resp = await axios.post(url, payload, {
      headers,
      validateStatus: () => true,
    });

    if (resp.status !== 200) {
      return res.status(resp.status).json({ success: false, error: resp.data });
    }

    // Shape success back to FE
    return res.status(200).json({
      success: true,
      count: Array.isArray(mapped) ? mapped.length : 1,
      creator_response: resp.data, // includes IDs in result[].data.ID
    });
  } catch (err) {
    console.error(
      "Error in /api/creator/leads:",
      err?.response?.data || err.message
    );
    return res.status(err?.response?.status || 500).json({
      success: false,
      error: err?.response?.data || {
        message: err.message || "Internal error",
      },
    });
  }
});

/* ===== CRM: Update existing Lead - Trigger_WhatsApp_Notification + boat show stand fields ===== */
async function updateLeadTriggerWhatsApp(org, leadId, formData = {}) {
  try {
    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();
    const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads/${leadId}`;
    const updateFields = {
      id: leadId,
      Trigger_WhatsApp_Notification: true,
    };
    // Boat show stand / meeting fields
    const tourGivenBy = formData.Tour_Given_By ?? formData.tourGivenBy;
    if (tourGivenBy) updateFields.Tour_Given_By1 = tourGivenBy;
    const tourGivenByMobile =
      formData.Tour_Given_By_Mobile ?? formData.tourGivenByMobile;
    if (tourGivenByMobile)
      updateFields.Tour_Given_By_Mobile = tourGivenByMobile;
    const meetingDate = formatDateDDMMMYYYY(
      formData.fromDate ?? formData.From_Date
    );
    if (meetingDate) updateFields.Boat_Show_Stand_Meeting_Date = meetingDate;
    const meetingTime = formData.fromTime ?? formData.From_Time;
    if (meetingTime)
      updateFields.Boat_Show_Stand_Meeting_Time = formatTime12Hour(meetingTime);
    const interestedYacht =
      formData.Boat_Show_Stand_Interested_Yacht ||
      formData.modelInterested ||
      formData.Model_Type ||
      "Not Sure";
    updateFields.Boat_Show_Stand_Interested_Yacht = interestedYacht;
    const boatShowName = formData.boatShowName ?? formData.Boat_Show;
    if (boatShowName) updateFields.Boat_Show = boatShowName;

    const payload = { data: [updateFields] };
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
    if (response.status === 200 || response.status === 201) {
      return { success: true, leadId };
    }
    console.error(
      `❌ Failed to update Lead fields. Status: ${response.status}`,
      response.data
    );
    throw new Error(
      response.data?.data?.[0]?.message || `Update failed: ${response.status}`
    );
  } catch (error) {
    console.error(`❌ Error in updateLeadTriggerWhatsApp:`, error);
    throw error;
  }
}

/* ===== CRM: Update existing Contact - fields + Boat_Show_New (picklist) + Event_Boat_Show (campaign lookup) ===== */
async function updateContactWithBoatShowAndCampaign(
  org,
  contactId,
  formData,
  boatShowName,
  campaignId
) {
  try {
    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();
    const url = `${cfg.ZOHO_CRM_BASE_URL}/Contacts/${contactId}`;
    const payload = {
      data: [
        {
          id: contactId,
          First_Name: formData.First_Name ?? formData.firstName ?? undefined,
          Last_Name: formData.Last_Name ?? formData.lastName ?? undefined,
          Email: formData.Email ?? formData.email ?? undefined,
          Phone:
            formData.Mobile ??
            formData.mobile ??
            formData.Phone ??
            formData.phone ??
            undefined,
          Boat_Show_New: boatShowName || undefined,
          Event_Boat_Show: campaignId ? { id: campaignId } : undefined,
          // Boat show stand / meeting fields
          Tour_Given_By1:
            formData.Tour_Given_By ?? formData.tourGivenBy ?? undefined,
          Tour_Given_By_Mobile:
            formData.Tour_Given_By_Mobile ??
            formData.tourGivenByMobile ??
            undefined,
          Boat_Show_Stand_Meeting_Date: formatDateDDMMMYYYY(
            formData.fromDate ?? formData.From_Date
          ),
          Boat_Show_Stand_Meeting_Time: formatTime12Hour(
            formData.fromTime ?? formData.From_Time
          ),
          Boat_Show_Stand_Interested_Yacht:
            formData.Boat_Show_Stand_Interested_Yacht ||
            formData.modelInterested ||
            formData.Model_Type ||
            "Not Sure",
        },
      ],
    };
    // Remove undefined keys so we don't send empty updates
    payload.data[0] = Object.fromEntries(
      Object.entries(payload.data[0]).filter(([, v]) => v !== undefined)
    );
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
    if (response.status === 200 || response.status === 201) {
      return { success: true, contactId };
    }
    console.error(
      `❌ Failed to update Contact. Status: ${response.status}`,
      response.data
    );
    throw new Error(
      response.data?.data?.[0]?.message || `Update failed: ${response.status}`
    );
  } catch (error) {
    console.error(`❌ Error in updateContactWithBoatShowAndCampaign:`, error);
    throw error;
  }
}

/* ===== CRM: Update Contact's Campaign lookup (e.g. other org Contacts have Campaign field) ===== */
async function updateContactCampaign(org, contactId, campaignId) {
  if (!contactId || !campaignId)
    return { success: false, message: "Missing contactId or campaignId" };
  try {
    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();
    const url = `${cfg.ZOHO_CRM_BASE_URL}/Contacts/${contactId}`;
    const payload = {
      data: [{ id: contactId, Campaign: { id: campaignId } }],
    };
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
    if (response.status === 200 || response.status === 201) {
      return { success: true, contactId, campaignId };
    }
    console.error(
      `❌ Failed to update Contact Campaign. Status: ${response.status}`,
      response.data
    );
    throw new Error(
      response.data?.data?.[0]?.message || `Update failed: ${response.status}`
    );
  } catch (error) {
    console.error(`❌ Error in updateContactCampaign:`, error);
    throw error;
  }
}

/* ===== CRM: Add Lead to Campaigns Related List ===== */
async function addLeadToCampaigns(org, leadId, leadData) {
  try {
    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();

    // Get the campaign ID from lead data based on org
    let campaignId;
    if (org === "other") {
      campaignId = leadData.charterCampaignId;
    } else {
      campaignId = leadData.sunreefYachtCampaignId;
    }

    if (!campaignId) {
      return {
        success: true,
        leadId: leadId,
        campaignId: null,
        message: "No campaign ID provided, skipped campaign addition",
        skipped: true,
      };
    }

    // Check if lead is already in the campaign to avoid duplicates
    try {
      const isAlreadyInCampaign = await checkLeadInCampaign(
        org,
        leadId,
        campaignId
      );
      if (isAlreadyInCampaign) {
        return {
          success: true,
          leadId: leadId,
          campaignId: campaignId,
          message: "Lead already in Campaigns",
          skipped: true,
        };
      }
    } catch (checkError) {
      console.warn(
        `⚠️ Could not check if lead is already in campaign, proceeding anyway:`,
        checkError.message
      );
    }

    // Prepare the payload for adding relation between Lead and Campaign
    const payload = {
      data: [
        {
          id: campaignId,
          Member_Status: CAMPAIGN_MEMBER_STATUS,
        },
      ],
    };

    // API endpoint: PUT /{module_api_name}/{record_id}/{related_list_api_name}/{related_record_id}
    // For Leads to Campaigns: PUT /Leads/{lead_id}/Campaigns
    const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads/${leadId}/Campaigns`;

    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        leadId: leadId,
        campaignId: campaignId,
        message: "Lead successfully added to Campaigns",
        response: response.data,
      };
    } else {
      console.error(
        `❌ Failed to add lead to Campaigns. Status: ${response.status}`
      );
      console.error(`❌ Response:`, response.data);

      // Handle specific error cases
      if (
        response.status === 400 &&
        response.data?.data?.[0]?.code === "INVALID_DATA"
      ) {
        throw new Error(
          `Invalid campaign data. Please check CAMPAIGN_ID: ${campaignId}`
        );
      } else if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please check your OAuth token and scope (ZohoCRM.modules.leads.UPDATE)"
        );
      } else if (response.status === 403) {
        throw new Error(
          "Permission denied. User does not have permission to update related records"
        );
      } else if (response.status === 404) {
        throw new Error(`Campaign not found with ID: ${campaignId}`);
      }

      throw new Error(
        `Failed to add lead to Campaigns: ${response.status} - ${JSON.stringify(
          response.data
        )}`
      );
    }
  } catch (error) {
    console.error(`❌ Error in addLeadToCampaigns:`, error);
    throw error;
  }
}

/* ===== CRM: Check if Lead is already in Campaign ===== */
async function checkLeadInCampaign(org, leadId, campaignId) {
  try {
    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();

    // Get related campaigns for the lead
    const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads/${leadId}/Campaigns`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    if (response.status === 200 && response.data?.data) {
      const campaigns = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      const isInCampaign = campaigns.some(
        (campaign) => campaign.id === campaignId
      );
      return isInCampaign;
    }

    return false;
  } catch (error) {
    console.warn(`⚠️ Could not check if lead is in campaign:`, error.message);
    return false;
  }
}

/* ===== Helper function to get related Events from Lead record ===== */
async function getRelatedEventsFromLead(orgKey, leadId) {
  try {
    const cfg = getOrgConfig(orgKey);
    const token = await getTokenManager(orgKey).get();

    const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads/${leadId}/Events`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        fields:
          "Subject,Start_DateTime,End_DateTime,Owner,Event_Title,Location,Status,Description",
        sort_by: "Created_Time",
        sort_order: "desc",
      },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const events = response.data?.data || [];

      // Format the events data
      const formattedEvents = events.map((event) => ({
        id: event.id,
        subject: event.Subject || event.Event_Title || "No Subject",
        startDateTime: event.Start_DateTime,
        endDateTime: event.End_DateTime,
        host: event.Owner
          ? {
              name: event.Owner.name,
              id: event.Owner.id,
              email: event.Owner.email,
            }
          : null,
        location: event.Location || "No Location",
        status: event.Status || "Unknown",
        description: event.Description || "",
        createdTime: event.Created_Time,
        modifiedTime: event.Modified_Time,
      }));

      return {
        success: true,
        count: formattedEvents.length,
        events: formattedEvents,
      };
    } else {
      // console.error(`❌ Failed to fetch Events for Lead ${leadId}:`, response.status, response.data);

      // Handle specific error cases
      if (response.status === 400 && response.data?.code === "INVALID_DATA") {
        if (
          response.data.message?.includes(
            "related id given seems to be invalid"
          )
        ) {
          return {
            success: false,
            error: "Lead ID not found or invalid",
            details: response.data,
            message: "The Lead record with this ID does not exist in the CRM",
          };
        }
      }

      return {
        success: false,
        error: "Failed to fetch related Events",
        details: response.data,
        message: response.data?.message || "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error(
      `❌ Error fetching related Events for Lead ${leadId}:`,
      error
    );
    return {
      success: false,
      error: "Internal server error",
      message: error.message,
    };
  }
}

/* ===== Get Related Events from Lead Record ===== */
/*
 * API Endpoint: GET /api/leads/:leadId/events
 * Purpose: Get all related Events from a specific Lead record
 * Parameters:
 *   - leadId: The unique ID of the Lead record
 *   - org: Organization to search in (default: "main")
 * Response:
 *   - success: boolean
 *   - leadId: string
 *   - org: string
 *   - count: number of events found
 *   - events: array of event objects with host, start/end times, etc.
 */
app.get("/api/leads/:leadId/events", async (req, res) => {
  try {
    const { leadId } = req.params;
    const { org = "main" } = req.query;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: "Lead ID is required",
      });
    }

    // Use the helper function to get related events
    const result = await getRelatedEventsFromLead(org, leadId);

    if (result.success) {
      return res.json({
        success: true,
        leadId: leadId,
        org: org,
        count: result.count,
        events: result.events,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        details: result.details,
        message: result.message,
      });
    }
  } catch (error) {
    console.error(`❌ API Error fetching related Events:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/* ===== Get Related Events from Lead in Both Orgs ===== */
/*
 * API Endpoint: GET /api/leads/:leadId/events/both
 * Purpose: Get all related Events from a specific Lead record in both MAIN and OTHER orgs
 * Parameters:
 *   - leadId: The unique ID of the Lead record
 * Response:
 *   - success: boolean
 *   - leadId: string
 *   - totalCount: total number of events found across both orgs
 *   - results: object containing main and other org results
 *     - main: { success, count, events, error }
 *     - other: { success, count, events, error }
 */
app.get("/api/leads/:leadId/events/both", async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: "Lead ID is required",
      });
    }

    // Check which orgs are available
    const enabledOrgs = Object.keys(ORGS).filter(
      (k) => !!ORGS[k].REFRESH_TOKEN
    );
    const bothAvailable =
      enabledOrgs.includes("main") && enabledOrgs.includes("other");

    if (!bothAvailable) {
      return res.status(400).json({
        success: false,
        error: "Both main and other orgs are not available",
      });
    }

    // Fetch events from both orgs
    const [mainResult, otherResult] = await Promise.allSettled([
      getRelatedEventsFromLead("main", leadId),
      getRelatedEventsFromLead("other", leadId),
    ]);

    const results = {
      main:
        mainResult.status === "fulfilled"
          ? mainResult.value
          : { success: false, error: mainResult.reason?.message },
      other:
        otherResult.status === "fulfilled"
          ? otherResult.value
          : { success: false, error: otherResult.reason?.message },
    };

    const totalEvents =
      (results.main.events || []).length + (results.other.events || []).length;

    return res.json({
      success: true,
      leadId: leadId,
      totalCount: totalEvents,
      results: {
        main: {
          success: results.main.success,
          count: results.main.count || 0,
          events: results.main.events || [],
          error: results.main.error,
        },
        other: {
          success: results.other.success,
          count: results.other.count || 0,
          events: results.other.events || [],
          error: results.other.error,
        },
      },
    });
  } catch (error) {
    console.error(
      `❌ API Error fetching related Events from both orgs:`,
      error
    );
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/* ===== Get Sample Lead IDs for Testing ===== */
app.get("/api/leads/sample-ids", async (req, res) => {
  try {
    const { org = "main" } = req.query;

    const cfg = getOrgConfig(org);
    const token = await getTokenManager(org).get();

    const url = `${cfg.ZOHO_CRM_BASE_URL}/Leads`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        fields: "id,First_Name,Last_Name,Email",
        per_page: 5,
        sort_by: "Created_Time",
        sort_order: "desc",
      },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const leads = response.data?.data || [];

      const sampleLeads = leads.map((lead) => ({
        id: lead.id,
        name:
          `${lead.First_Name || ""} ${lead.Last_Name || ""}`.trim() ||
          "No Name",
        email: lead.Email || "No Email",
      }));

      return res.json({
        success: true,
        org: org,
        count: sampleLeads.length,
        leads: sampleLeads,
        message: "Use these Lead IDs to test the related Events API",
      });
    } else {
      console.error(
        `❌ Failed to fetch sample Lead IDs:`,
        response.status,
        response.data
      );
      return res.status(response.status).json({
        success: false,
        error: "Failed to fetch sample Lead IDs",
        details: response.data,
      });
    }
  } catch (error) {
    console.error(`❌ Error fetching sample Lead IDs:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/* ===== Helpers ===== */
/** Format ISO date (YYYY-MM-DD) → DD-MMM-YYYY (e.g. 09-Sep-2025) */
function formatDateDDMMMYYYY(isoDate) {
  if (!isoDate) return undefined;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return undefined;
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day}-${months[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}

/** Format 24h time (HH:MM) → 12h with AM/PM (e.g. 08:00 AM, 02:30 PM) */
function formatTime12Hour(time24) {
  if (!time24) return undefined;
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )} ${ampm}`;
}

/* ===== OpenAI Lead Enrichment ===== */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

function buildEnrichPrompt(payload) {
  const lines = [
    "You are an expert people enrichment agent. Find ALL available public information about this person.",
    "CRITICAL OUTPUT RULES (MUST FOLLOW):",
    "- Do NOT add extra blank lines between sections or paragraphs.",
    "- Use single line spacing only.",
    "- Do NOT include ANY HTML tags (no <b>, <br>, <p>, <div>, etc.).",
    "- Use ONLY Markdown formatting.",
    "- All section headings MUST be bold using Markdown (**HEADING**).",
    "- Example heading format: **YACHT AFFORDABILITY ANALYSIS**",
    "- Do NOT wrap content in code blocks.",
    "",
    "SEARCH STRATEGY:",
    "- Search multiple variations: full name, first+last, email domain, company from email",
    "- Search for the person's name in the company website, LinkedIn page, and employee directories",
    "- Normalize names: remove/keep accents (e.g., José/Jose), handle hyphens/spaces (De la Cruz/Delacruz), try initials",
    "- Generate permutations: <first> <last>, <last> <first>, <first initial> <last>, <first> <last initial>",
    "- Build email permutations to confirm identities: <first>.<last>@, <first>@, <first><last>@, <f><last>@",
    "- Try alternative spellings and name variations (e.g., Mahesh vs Maheesh, Uttwani vs Uttwani)",
    "- EXTRACT COMPANY FROM EMAIL: If email is like 'suraj@helistechlabs.com' or 'mahesh@sunreef.com', extract company name (helistechlabs, sunreef)",
    "- COMPANY VERIFICATION: First verify if the company exists by searching for the company website and LinkedIn page",
    "- EMPLOYEE SEARCH: If company exists, search for employees on company LinkedIn page, team pages, about pages",
    "- For social profiles, run targeted queries using site filters and variants, e.g.:",
    '  • site:linkedin.com/in "<first> <last>" <country or city>',
    "  • site:linkedin.com/company <company> staff <first> <last>",
    '  • site:linkedin.com/in "<first initial> <last>"',
    '  • site:linkedin.com/in "<first> <last>" <company>',
    '  • site:linkedin.com/in "<last> <first>" <country>',
    "  • site:linkedin.com/company <company> employees <first> <last>",
    "  • site:<company-website> team <first> <last>",
    "  • site:<company-website> about <first> <last>",
    "  • filetype:pdf <first> <last> CV OR resume OR bio",
    "  • intitle:team OR intitle:leadership <first> <last> <company>",
    "- Look for: LinkedIn, company websites, press releases, news articles, social media",
    "- Cross-reference email domain with company websites and employee directories",
    "- Search in both English and local languages (French, German, Arabic, Polish, etc.)",
    "- Use transliterations where relevant (e.g., Cyrillic/Latin) and diacritic-free versions",
    "- Use phone country code to infer likely location and add city/country to queries",
    "- Try searching without country filter if initial searches fail",
    "- Search for company employees if individual not found directly",
    "- Reverse-lookup phone number in quotes and with/without spaces",
    "- Search recent time ranges for news (past year) when name is common",
    "- WEALTH & FINANCIAL SEARCHES (HIGH PRIORITY):",
    '  • "<first> <last>" net worth OR wealth OR assets',
    '  • "<first> <last>" owner OR founder OR shareholder',
    '  • "<first> <last>" company OR business OR "owns"',
    '  • "<first> <last>" property OR real estate OR yacht OR aircraft',
    '  • site:forbes.com "<first> <last>"',
    '  • site:bloomberg.com "<first> <last>"',
    '  • "<first> <last>" <country> business registry OR company registry',
    '  • "<first> <last>" <country> property registry OR land registry',
    '  • "<first> <last>" equity OR stake OR shares',
    '  • "<first> <last>" board compensation OR salary',
    '  • "<job title>" <industry> <country> salary OR compensation OR "average salary"',
    '  • "<position>" <company type> salary range <country>',
    '  • site:glassdoor.com OR site:salary.com OR site:payscale.com "<job title>" <country>',
    "- FAMILY BACKGROUND & INHERITANCE SEARCHES (HIGH PRIORITY):",
    '  • "<first> <last>" family OR parents OR father OR mother OR "family business" OR "family wealth"',
    '  • "<first> <last>" son OR daughter OR heir OR inheritance',
    '  • "<first> <last>" father OR mother OR parent <country> business OR company OR wealth',
    '  • "<last name>" family <country> OR "<last name>" dynasty OR "<last name>" group',
    '  • "<first> <last>" father name OR mother name',
    '  • If last name suggests family business (e.g., AlHameli, Almheiri, Al mezaini), search: "<last name>" group OR "<last name>" holdings OR "<last name>" company',
    "- EDUCATION / UNIVERSITY SEARCHES (HIGH PRIORITY WHEN MISSING):",
    '  • "<first> <last>" university OR alma mater OR graduated OR degree',
    '  • "<first> <last>" studied at OR diplôme OR études OR école',
    '  • "<first> <last>" MBA OR Master of OR Bachelor of',
    '  • site:wikipedia.org "<first> <last>" education OR career',
    "  • site:<company-website> our team OR management <first> <last>",
    "  • If education is not found, explicitly state it is not publicly available.",
    "",
    "OUTPUT FORMAT (CRITICAL - FOLLOW THIS EXACT ORDER):",
    "1. **QUICK SUMMARY:**",
    "- Exactly 4–5 bullet points",
    "- Use format: '- **Key**: Value'",
    "- Include role, company, industry, location, and status",
    "2. **YACHT AFFORDABILITY ANALYSIS:**",
    "- Analyze purchase vs charter capability",
    "- Consider personal income AND family wealth",
    "- Conclude clearly: CAN PURCHASE / CAN CHARTER / NOT REALISTIC",
    "3. **SALARY & INCOME ESTIMATION:**",
    "- Estimate salary range based on role, industry, country",
    "- Estimate net worth using conservative assumptions",
    "4. **DETAILED SECTIONS:**",
    "- Comprehensive profile summary",
    "- Company information",
    "- Career history",
    "- Education",
    "- Financial & assets",
    "- Family background & inheritance potential",
    "- Social media & online presence",
    "- News & media mentions",
    "- Verified sources",
    "",
    "FINAL REQUIREMENT (MANDATORY):",
    "At the VERY END of the output, add EXACTLY one line in this format:",
    "AI_PROFILE_SCORE: <number between 0 and 100>",
    "Rules:",
    "- Output ONLY one integer number",
    "- No explanation on this line",
    "- Do NOT repeat this anywhere else",
    "- This MUST be the last line of the response",
    "Input data to research:",
    "",
    "SCORING INSTRUCTIONS (CRITICAL):",
    "You must calculate an AI Profile Score based on the prospect's financial strength and purchasing capability.",
    "The score MUST strictly follow these ranges:",
    "- 0–25: General (limited or no financial capacity, no public wealth indicators)",
    "- 26–50: HNI (high income professional or business owner, limited asset visibility)",
    "- 51–75: UHNI (significant business ownership, assets, family wealth, or strong indicators)",
    "- 76–100: Billionaire (very large-scale business ownership, public wealth, major assets)",
    "Scoring rules:",
    "- Use conservative assumptions",
    "- If information is missing or unverified, assign a LOWER score",
    "- If the conclusion is NOT REALISTIC, score MUST be between 0 and 10",
    "- If conclusion is CAN CHARTER, score MUST be between 20 and 40",
    "- If conclusion is CAN PURCHASE, score MUST be 50 or above",
    "- Do NOT guess or inflate scores",
    JSON.stringify(payload),
  ];
  return lines.join("\n");
}

function extractAiScore(text) {
  if (!text || !text.includes("AI_PROFILE_SCORE:")) return null;
  const idx = text.indexOf("AI_PROFILE_SCORE:");
  const after = text.substring(idx + "AI_PROFILE_SCORE:".length).trim();
  const firstLine = after.split("\n")[0].trim();
  const score = parseInt(firstLine, 10);
  if (isNaN(score)) return null;
  return Math.max(0, Math.min(100, score));
}

function scoreToWealthCategory(score) {
  if (score === null || score === undefined) return null;
  if (score <= 25) return "General";
  if (score <= 50) return "HNW (High Net-Worth)";
  if (score <= 75) return "UHNW (Ultra High Net-Worth)";
  return "Billionaire";
}

/** POST /api/enrich — enrich a lead via OpenAI web search */
app.post("/api/enrich", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ success: false, error: "OPENAI_API_KEY not configured" });
    }

    const { firstName, lastName, email, mobile, country } = req.body || {};
    if (!firstName && !lastName && !email) {
      return res.status(400).json({
        success: false,
        error: "At least firstName, lastName or email is required",
      });
    }

    const payload = { firstName, lastName, email, mobile, country };
    const promptText = buildEnrichPrompt(payload);

    const body = {
      model: "gpt-4.1",
      instructions:
        "Search and summarize findings about the person based on the inputs. " +
        "Return PLAIN TEXT with Markdown formatting only. " +
        "DO NOT return HTML. " +
        "DO NOT add extra blank lines. " +
        "All section headings must be bold using Markdown (**HEADING**).",
      input: promptText,
      tools: [{ type: "web_search", search_context_size: "high" }],
      tool_choice: "auto",
      max_output_tokens: 2400,
      temperature: 0.2,
      include: ["web_search_call.action.sources"],
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    const openaiResp = await axios.post(
      "https://api.openai.com/v1/responses",
      body,
      {
        headers,
        validateStatus: () => true,
        timeout: 60000,
      }
    );

    if (openaiResp.status !== 200) {
      console.error(
        "❌ OpenAI enrich error:",
        openaiResp.status,
        openaiResp.data
      );
      return res
        .status(openaiResp.status)
        .json({ success: false, error: openaiResp.data });
    }

    // Extract output text
    let outputText = "";
    const respData = openaiResp.data;
    if (respData.output_text) {
      outputText = String(respData.output_text);
    } else if (Array.isArray(respData.output)) {
      for (const item of respData.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === "output_text") outputText += String(c.text || "");
          }
        }
      }
    }

    const aiLeadScore = extractAiScore(outputText);
    const wealthCategory = scoreToWealthCategory(aiLeadScore);
    const profileSummary = `**ENRICH RUN #1 — FIRST UPDATE**--->${outputText}`;

    return res.status(200).json({
      success: true,
      wealthCategory,
      aiLeadScore,
      profileSummary,
    });
  } catch (err) {
    console.error("❌ Error in /api/enrich:", err.message);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Internal error" });
  }
});

/* ===== Boot ===== */
const PORT =
  process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;
app.listen(PORT, () => {
  // server started (log removed by request)
});

module.exports = app;

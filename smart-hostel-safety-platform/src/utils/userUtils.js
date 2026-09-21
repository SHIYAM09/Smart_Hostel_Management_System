export function getSanitizedUsername(userObj, defaultFallback = "User") {
  if (!userObj) return defaultFallback;

  let raw = "";
  if (typeof userObj === "string") {
    raw = userObj;
  } else if (typeof userObj === "object") {
    if (userObj.username && typeof userObj.username === "string" && !userObj.username.includes("@")) {
      raw = userObj.username;
    } else if (userObj.fullName && typeof userObj.fullName === "string" && !userObj.fullName.includes("@")) {
      raw = userObj.fullName;
    } else if (userObj.name && typeof userObj.name === "string" && !userObj.name.includes("@")) {
      raw = userObj.name;
    } else {
      raw = userObj.username || userObj.fullName || userObj.name || userObj.email || "";
    }
  }

  if (!raw || typeof raw !== "string") return defaultFallback;

  if (raw.includes("@")) {
    raw = raw.split("@")[0].trim();
  }

  return raw.trim() || defaultFallback;
}


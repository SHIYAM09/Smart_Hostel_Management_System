export function getSanitizedUsername(userObj, defaultFallback = "Student User") {
  if (!userObj) return defaultFallback;
  let raw = "";
  if (typeof userObj === "string") {
    raw = userObj;
  } else {
    raw = userObj.username || userObj.fullName || userObj.name || "";
  }

  if (!raw || typeof raw !== "string") return defaultFallback;

  if (raw.includes("@")) {
    const prefix = raw.split("@")[0].trim();
    if (prefix.toLowerCase() === "shyammayila" || prefix.toLowerCase() === "shiyam") {
      return "SHIYAM M";
    }
    return prefix || defaultFallback;
  }

  if (raw.toLowerCase() === "shyammayila") {
    return "SHIYAM M";
  }

  return raw.trim() || defaultFallback;
}

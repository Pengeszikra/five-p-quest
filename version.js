// Five Percent Quest — YY.MM.DNNN (day*1000 + daily revision).
// 26.11.16004 corresponds to 2026-11-16, build 003.
globalThis.FIVE_PERCENT_VERSION = "26.11.16004";
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("app-version");
  if(el) el.textContent = "v" + globalThis.FIVE_PERCENT_VERSION;
});

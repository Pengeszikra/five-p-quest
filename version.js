// Five Percent Quest — YY.MM.DNNN (day*1000 + daily revision).
// 26.11.18001 corresponds to 2026-11-18, build 001.
globalThis.FIVE_PERCENT_VERSION = "26.11.18001";
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("app-version");
  if(el) el.textContent = "v" + globalThis.FIVE_PERCENT_VERSION;
});

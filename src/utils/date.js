// Tanggal hari ini (YYYY-MM-DD) menurut WIB, bukan UTC server
export const todayJakarta = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
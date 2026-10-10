// Error "data tidak ditemukan" yang seragam dengan kode PostgREST
export function notFound() {
  const err = new Error("Data tidak ditemukan");
  err.code = "PGRST116";
  return err;
}

// Petakan error database ke status HTTP yang sesuai
export function sendError(res, err) {
  if (err.code === "PGRST116") {
    return res.status(404).json({ error: "Data tidak ditemukan" });
  }
  // 23505 unik, 23503 foreign key, 22P02 format salah, 23514 check, 23502 not null
  if (["23505", "23503", "22P02", "23514", "23502"].includes(err.code)) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: err.message });
}
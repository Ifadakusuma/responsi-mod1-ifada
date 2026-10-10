import { LoanModel } from "../models/loanModel.js";
import { todayJakarta } from "../utils/date.js";
import { sendError } from "../utils/errors.js";

const VALID_STATUS = ["Dipinjam", "Dikembalikan", "Terlambat"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Validasi field; mengembalikan pesan error atau null jika valid
function checkFields({ member_id, book_id, loan_date, due_date, return_date, status }) {
  if (member_id !== undefined && !UUID_REGEX.test(member_id)) {
    return "member_id harus berupa UUID";
  }
  if (book_id !== undefined && !UUID_REGEX.test(book_id)) {
    return "book_id harus berupa UUID";
  }
  const dates = { loan_date, due_date, return_date };
  for (const [key, value] of Object.entries(dates)) {
    if (value !== undefined && value !== null && !DATE_REGEX.test(value)) {
      return `${key} harus berformat YYYY-MM-DD`;
    }
  }
  if (status !== undefined && !VALID_STATUS.includes(status)) {
    return `Status harus salah satu dari: ${VALID_STATUS.join(", ")}`;
  }
  return null;
}

const removeUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

export const LoanController = {
  async getAll(req, res) {
    try {
      const { status, member_id, book_id } = req.query;
      const invalid = checkFields({ status, member_id, book_id });
      if (invalid) return res.status(400).json({ error: invalid });

      res.json(await LoanModel.getAll({ status, member_id, book_id }));
    } catch (err) {
      sendError(res, err);
    }
  },

  async getById(req, res) {
    try {
      res.json(await LoanModel.getById(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },

  async create(req, res) {
    try {
      const { member_id, book_id, loan_date, due_date, return_date } = req.body;
      let { status } = req.body;

      if (!member_id || !book_id || !due_date) {
        return res.status(400).json({
          error: "member_id, book_id, dan due_date wajib diisi",
        });
      }
      const invalid = checkFields(req.body);
      if (invalid) return res.status(400).json({ error: invalid });

      // Jika status tidak dikirim, tentukan otomatis
      if (!status) {
        if (return_date) status = "Dikembalikan";
        else if (due_date < todayJakarta()) status = "Terlambat";
        else status = "Dipinjam";
      }

      const loan = await LoanModel.create(
        removeUndefined({ member_id, book_id, loan_date, due_date, return_date, status })
      );
      res.status(201).json(loan);
    } catch (err) {
      sendError(res, err);
    }
  },

  async update(req, res) {
    try {
      const invalid = checkFields(req.body);
      if (invalid) return res.status(400).json({ error: invalid });

      const { member_id, book_id, loan_date, due_date, return_date, status } =
        req.body;
      const payload = removeUndefined({
        member_id,
        book_id,
        loan_date,
        due_date,
        return_date,
        status,
      });

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Tidak ada data untuk diubah" });
      }

      // Jika return_date diisi dan status tidak dikirim, otomatis Dikembalikan
      if (return_date && !status) payload.status = "Dikembalikan";

      res.json(await LoanModel.update(req.params.id, payload));
    } catch (err) {
      sendError(res, err);
    }
  },

  async remove(req, res) {
    try {
      res.json(await LoanModel.remove(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },
};
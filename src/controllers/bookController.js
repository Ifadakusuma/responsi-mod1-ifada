import { BookModel } from "../models/bookModel.js";
import { sendError } from "../utils/errors.js";

export const BookController = {
  async getAll(req, res) {
    try {
      const { title, author } = req.query;
      res.json(await BookModel.getAll({ title, author }));
    } catch (err) {
      sendError(res, err);
    }
  },

  async getById(req, res) {
    try {
      res.json(await BookModel.getById(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },

  async create(req, res) {
    try {
      const { title, author, isbn } = req.body;
      if (!title) {
        return res.status(400).json({ error: "title wajib diisi" });
      }
      const book = await BookModel.create({ title, author, isbn });
      res.status(201).json(book);
    } catch (err) {
      sendError(res, err);
    }
  },

  async update(req, res) {
    try {
      const { title, author, isbn } = req.body;
      const payload = Object.fromEntries(
        Object.entries({ title, author, isbn }).filter(([, v]) => v !== undefined)
      );
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Tidak ada data untuk diubah" });
      }
      res.json(await BookModel.update(req.params.id, payload));
    } catch (err) {
      sendError(res, err);
    }
  },

  async remove(req, res) {
    try {
      res.json(await BookModel.remove(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },
};
import { MemberModel } from "../models/memberModel.js";
import { sendError } from "../utils/errors.js";

export const MemberController = {
  async getAll(req, res) {
    try {
      res.json(await MemberModel.getAll({ name: req.query.name }));
    } catch (err) {
      sendError(res, err);
    }
  },

  async getById(req, res) {
    try {
      res.json(await MemberModel.getById(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },

  async create(req, res) {
    try {
      const { name, email, phone } = req.body;
      if (!name) {
        return res.status(400).json({ error: "name wajib diisi" });
      }
      const member = await MemberModel.create({ name, email, phone });
      res.status(201).json(member);
    } catch (err) {
      sendError(res, err);
    }
  },

  async update(req, res) {
    try {
      const { name, email, phone } = req.body;
      const payload = Object.fromEntries(
        Object.entries({ name, email, phone }).filter(([, v]) => v !== undefined)
      );
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Tidak ada data untuk diubah" });
      }
      res.json(await MemberModel.update(req.params.id, payload));
    } catch (err) {
      sendError(res, err);
    }
  },

  async remove(req, res) {
    try {
      res.json(await MemberModel.remove(req.params.id));
    } catch (err) {
      sendError(res, err);
    }
  },
};
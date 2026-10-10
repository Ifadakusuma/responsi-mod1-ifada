import { supabase } from "../config/supabaseClient.js";
import { todayJakarta } from "../utils/date.js";
import { notFound } from "../utils/errors.js";

// Kolom yang diambil, termasuk data anggota & buku lewat foreign key
const SELECT_FIELDS = `
  id, loan_date, due_date, return_date, status,
  members ( id, name, email ),
  books ( id, title, author )
`;

// Tandai peminjaman yang lewat jatuh tempo dan belum kembali sebagai Terlambat
async function syncOverdueStatus() {
  const { error } = await supabase
    .from("loans")
    .update({ status: "Terlambat" })
    .eq("status", "Dipinjam")
    .is("return_date", null)
    .lt("due_date", todayJakarta());
  if (error) throw error;
}

export const LoanModel = {
  async getAll({ status, member_id, book_id } = {}) {
    await syncOverdueStatus();

    let query = supabase
      .from("loans")
      .select(SELECT_FIELDS)
      .order("loan_date", { ascending: false });

    if (status) query = query.eq("status", status);
    if (member_id) query = query.eq("member_id", member_id);
    if (book_id) query = query.eq("book_id", book_id);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    await syncOverdueStatus();

    const { data, error } = await supabase
      .from("loans")
      .select(SELECT_FIELDS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("loans")
      .insert([payload])
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("loans")
      .update(payload)
      .eq("id", id)
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("loans")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) throw notFound();
    return { message: "Loan deleted successfully" };
  },
};
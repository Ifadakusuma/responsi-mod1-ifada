import { supabase } from "../config/supabaseClient.js";
import { notFound } from "../utils/errors.js";

export const BookModel = {
  async getAll({ title, author } = {}) {
    let query = supabase.from("books").select("*").order("title");
    if (title) query = query.ilike("title", `%${title}%`);
    if (author) query = query.ilike("author", `%${author}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("books")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("books")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) throw notFound();
    return { message: "Book deleted successfully" };
  },
};
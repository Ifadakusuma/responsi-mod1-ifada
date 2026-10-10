import { supabase } from "../config/supabaseClient.js";
import { notFound } from "../utils/errors.js";

export const MemberModel = {
  async getAll({ name } = {}) {
    let query = supabase.from("members").select("*").order("name");
    if (name) query = query.ilike("name", `%${name}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("members")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("members")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) throw notFound();
    return { message: "Member deleted successfully" };
  },
};
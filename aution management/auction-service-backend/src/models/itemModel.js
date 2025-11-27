const supabase = require('../utils/supabase');

class ItemModel {
  async create(itemData) {
    const { data, error } = await supabase
      .from('auction_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getByAuctionId(auctionId) {
    const { data, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('auction_id', auctionId)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('auction_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('auction_items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new ItemModel();

const supabase = require('../utils/supabase');
const { generateRoomCode } = require('../utils/validators');

class AuctionModel {
  // Create new auction with room
  async create(auctionData) {
    // Generate unique room code
    const roomCode = generateRoomCode();

    const { data, error } = await supabase
      .from('auctions')
      .insert([{ ...auctionData, room_code: roomCode }])
      .select()
      .single();

    if (error) throw error;

    // Create associated auction room
    await this.createRoom(data.id, roomCode);

    return data;
  }

  // Create auction room
  async createRoom(auctionId, roomCode) {
    const { data, error } = await supabase
      .from('auction_rooms')
      .insert([{
        auction_id: auctionId,
        room_code: roomCode,
        active: true,
        participant_count: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all auctions with filters
  async getAll(filters = {}) {
    let query = supabase
      .from('auctions')
      .select('*, auction_items(*), auction_rooms(*)');

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.seller_id) {
      query = query.eq('seller_id', filters.seller_id);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Get single auction by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('auctions')
      .select('*, auction_items(*), auction_rooms(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get auction by room code
  async getByRoomCode(roomCode) {
    const { data, error } = await supabase
      .from('auctions')
      .select('*, auction_items(*), auction_rooms(*)')
      .eq('room_code', roomCode)
      .single();

    if (error) throw error;
    return data;
  }

  // Update auction
  async update(id, updates) {
    const { data, error } = await supabase
      .from('auctions')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete auction (soft delete by changing status)
  async delete(id) {
    const { data, error } = await supabase
      .from('auctions')
      .update({ status: 'CANCELLED', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Search auctions
  async search(searchTerm) {
    const { data, error } = await supabase
      .from('auctions')
      .select('*, auction_items(*), auction_rooms(*)')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Update room participant count
  async updateRoomParticipants(roomCode, count) {
    const { data, error } = await supabase
      .from('auction_rooms')
      .update({ participant_count: count, updated_at: new Date() })
      .eq('room_code', roomCode)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get active rooms
  async getActiveRooms() {
    const { data, error } = await supabase
      .from('auction_rooms')
      .select('*, auctions(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = new AuctionModel();

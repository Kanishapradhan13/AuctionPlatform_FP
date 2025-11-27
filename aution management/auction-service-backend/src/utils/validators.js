function validateAuction(auctionData) {
  const errors = [];

  if (!auctionData.title || auctionData.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!auctionData.description || auctionData.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!auctionData.start_time) {
    errors.push('Start time is required');
  }

  if (!auctionData.end_time) {
    errors.push('End time is required');
  }

  if (auctionData.start_time && auctionData.end_time) {
    const start = new Date(auctionData.start_time);
    const end = new Date(auctionData.end_time);

    if (end <= start) {
      errors.push('End time must be after start time');
    }

    const duration = (end - start) / (1000 * 60 * 60); // hours
    if (duration < 1) {
      errors.push('Auction must be at least 1 hour long');
    }
    if (duration > 720) { // 30 days
      errors.push('Auction cannot be longer than 30 days');
    }
  }

  if (!auctionData.reserve_price || auctionData.reserve_price <= 0) {
    errors.push('Reserve price must be greater than 0');
  }

  return errors;
}

function validateItem(itemData) {
  const errors = [];

  if (!itemData.item_type || !['LAND', 'VEHICLE'].includes(itemData.item_type)) {
    errors.push('Item type must be LAND or VEHICLE');
  }

  if (itemData.item_type === 'LAND') {
    if (!itemData.specifications?.land_size) {
      errors.push('Land size is required');
    }
    if (!itemData.specifications?.land_type) {
      errors.push('Land type is required');
    }
  }

  if (itemData.item_type === 'VEHICLE') {
    if (!itemData.specifications?.make) {
      errors.push('Vehicle make is required');
    }
    if (!itemData.specifications?.model) {
      errors.push('Vehicle model is required');
    }
    if (!itemData.specifications?.year || itemData.specifications.year < 1990) {
      errors.push('Valid year is required (1990 or later)');
    }
  }

  return errors;
}

function generateRoomCode() {
  // Generate a unique room code (8 characters: letters and numbers)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = { validateAuction, validateItem, generateRoomCode };

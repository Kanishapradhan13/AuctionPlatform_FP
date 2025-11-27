const { validateAuction, validateItem, generateRoomCode } = require('../../src/utils/validators');

describe('Auction Validators', () => {
  describe('validateAuction', () => {
    const validAuction = {
      title: 'Test Auction Title',
      description: 'This is a valid auction description with more than 20 characters',
      start_time: new Date('2025-01-01T10:00:00Z'),
      end_time: new Date('2025-01-02T10:00:00Z'),
      reserve_price: 1000
    };

    test('should pass validation with valid auction data', () => {
      const errors = validateAuction(validAuction);
      expect(errors).toHaveLength(0);
    });

    test('should fail if title is missing', () => {
      const auction = { ...validAuction, title: '' };
      const errors = validateAuction(auction);
      expect(errors).toContain('Title must be at least 5 characters');
    });

    test('should fail if title is less than 5 characters', () => {
      const auction = { ...validAuction, title: 'Hi' };
      const errors = validateAuction(auction);
      expect(errors).toContain('Title must be at least 5 characters');
    });

    test('should fail if description is missing', () => {
      const auction = { ...validAuction, description: '' };
      const errors = validateAuction(auction);
      expect(errors).toContain('Description must be at least 20 characters');
    });

    test('should fail if description is less than 20 characters', () => {
      const auction = { ...validAuction, description: 'Short desc' };
      const errors = validateAuction(auction);
      expect(errors).toContain('Description must be at least 20 characters');
    });

    test('should fail if start_time is missing', () => {
      const auction = { ...validAuction, start_time: null };
      const errors = validateAuction(auction);
      expect(errors).toContain('Start time is required');
    });

    test('should fail if end_time is missing', () => {
      const auction = { ...validAuction, end_time: null };
      const errors = validateAuction(auction);
      expect(errors).toContain('End time is required');
    });

    test('should fail if end_time is before start_time', () => {
      const auction = {
        ...validAuction,
        start_time: new Date('2025-01-02T10:00:00Z'),
        end_time: new Date('2025-01-01T10:00:00Z')
      };
      const errors = validateAuction(auction);
      expect(errors).toContain('End time must be after start time');
    });

    test('should fail if auction duration is less than 1 hour', () => {
      const auction = {
        ...validAuction,
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: new Date('2025-01-01T10:30:00Z')
      };
      const errors = validateAuction(auction);
      expect(errors).toContain('Auction must be at least 1 hour long');
    });

    test('should fail if auction duration is more than 30 days', () => {
      const auction = {
        ...validAuction,
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: new Date('2025-02-15T10:00:00Z')
      };
      const errors = validateAuction(auction);
      expect(errors).toContain('Auction cannot be longer than 30 days');
    });

    test('should pass if auction duration is exactly 1 hour', () => {
      const auction = {
        ...validAuction,
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: new Date('2025-01-01T11:00:00Z')
      };
      const errors = validateAuction(auction);
      expect(errors).toHaveLength(0);
    });

    test('should pass if auction duration is exactly 30 days', () => {
      const auction = {
        ...validAuction,
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: new Date('2025-01-31T10:00:00Z')
      };
      const errors = validateAuction(auction);
      expect(errors).toHaveLength(0);
    });

    test('should fail if reserve_price is missing', () => {
      const auction = { ...validAuction, reserve_price: null };
      const errors = validateAuction(auction);
      expect(errors).toContain('Reserve price must be greater than 0');
    });

    test('should fail if reserve_price is zero', () => {
      const auction = { ...validAuction, reserve_price: 0 };
      const errors = validateAuction(auction);
      expect(errors).toContain('Reserve price must be greater than 0');
    });

    test('should fail if reserve_price is negative', () => {
      const auction = { ...validAuction, reserve_price: -100 };
      const errors = validateAuction(auction);
      expect(errors).toContain('Reserve price must be greater than 0');
    });

    test('should return multiple errors for multiple invalid fields', () => {
      const auction = {
        title: 'Hi',
        description: 'Short',
        start_time: null,
        end_time: null,
        reserve_price: 0
      };
      const errors = validateAuction(auction);
      expect(errors.length).toBeGreaterThan(3);
    });
  });

  describe('validateItem', () => {
    describe('LAND item validation', () => {
      const validLandItem = {
        item_type: 'LAND',
        specifications: {
          land_size: '1000 sq ft',
          land_type: 'Residential',
          coordinates: '27.4712,89.6339',
          ownership_doc: 'DOC123456'
        }
      };

      test('should pass validation with valid land item', () => {
        const errors = validateItem(validLandItem);
        expect(errors).toHaveLength(0);
      });

      test('should fail if land_size is missing', () => {
        const item = {
          item_type: 'LAND',
          specifications: {
            land_type: 'Residential'
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Land size is required');
      });

      test('should fail if land_type is missing', () => {
        const item = {
          item_type: 'LAND',
          specifications: {
            land_size: '1000 sq ft'
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Land type is required');
      });

      test('should pass if optional fields are missing', () => {
        const item = {
          item_type: 'LAND',
          specifications: {
            land_size: '1000 sq ft',
            land_type: 'Residential'
          }
        };
        const errors = validateItem(item);
        expect(errors).toHaveLength(0);
      });
    });

    describe('VEHICLE item validation', () => {
      const validVehicleItem = {
        item_type: 'VEHICLE',
        specifications: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 15000,
          engine_type: 'Hybrid',
          registration_number: 'ABC123'
        }
      };

      test('should pass validation with valid vehicle item', () => {
        const errors = validateItem(validVehicleItem);
        expect(errors).toHaveLength(0);
      });

      test('should fail if make is missing', () => {
        const item = {
          item_type: 'VEHICLE',
          specifications: {
            model: 'Camry',
            year: 2020
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Vehicle make is required');
      });

      test('should fail if model is missing', () => {
        const item = {
          item_type: 'VEHICLE',
          specifications: {
            make: 'Toyota',
            year: 2020
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Vehicle model is required');
      });

      test('should fail if year is missing', () => {
        const item = {
          item_type: 'VEHICLE',
          specifications: {
            make: 'Toyota',
            model: 'Camry'
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Valid year is required (1990 or later)');
      });

      test('should fail if year is before 1990', () => {
        const item = {
          item_type: 'VEHICLE',
          specifications: {
            make: 'Toyota',
            model: 'Camry',
            year: 1985
          }
        };
        const errors = validateItem(item);
        expect(errors).toContain('Valid year is required (1990 or later)');
      });

      test('should pass if year is exactly 1990', () => {
        const item = {
          item_type: 'VEHICLE',
          specifications: {
            make: 'Toyota',
            model: 'Camry',
            year: 1990
          }
        };
        const errors = validateItem(item);
        expect(errors).toHaveLength(0);
      });
    });

    describe('Item type validation', () => {
      test('should fail if item_type is missing', () => {
        const item = {
          specifications: {}
        };
        const errors = validateItem(item);
        expect(errors).toContain('Item type must be LAND or VEHICLE');
      });

      test('should fail if item_type is invalid', () => {
        const item = {
          item_type: 'BOAT',
          specifications: {}
        };
        const errors = validateItem(item);
        expect(errors).toContain('Item type must be LAND or VEHICLE');
      });
    });
  });

  describe('generateRoomCode', () => {
    test('should generate a room code of 8 characters', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(8);
    });

    test('should generate room code with only alphanumeric characters', () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    test('should generate unique room codes', () => {
      const code1 = generateRoomCode();
      const code2 = generateRoomCode();
      const code3 = generateRoomCode();

      // While theoretically possible to generate duplicates,
      // it's extremely unlikely with 36^8 combinations
      const codes = new Set([code1, code2, code3]);
      expect(codes.size).toBe(3);
    });

    test('should generate multiple unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      // All 100 codes should be unique
      expect(codes.size).toBe(100);
    });
  });
});

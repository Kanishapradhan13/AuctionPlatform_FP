# Auction Service Tests

## Overview

This directory contains comprehensive test suites for the Auction Management Service, including unit tests and integration tests.

## Test Structure

```
tests/
├── setup.js                    # Test environment configuration
├── unit/                       # Unit tests (isolated components)
│   ├── validators.test.js     # Validation logic tests (34 tests)
│   ├── auctionModel.test.js   # Auction model tests (15 tests)
│   └── itemModel.test.js      # Item model tests (8 tests)
└── integration/                # Integration tests (API endpoints)
    └── auction.test.js        # Auction API tests (27 tests)
```

## Test Statistics

- **Total Tests:** 81
- **Test Suites:** 4
- **Pass Rate:** 100%
- **Code Coverage:** 78.38%

## Quick Start

### Install Dependencies
```bash
cd auction-service-backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Suite
```bash
# Unit tests only
npm test tests/unit/

# Integration tests only
npm test tests/integration/

# Specific file
npm test tests/unit/validators.test.js
```

### View Coverage Report
```bash
npm test -- --coverage

# HTML report will be in: coverage/lcov-report/index.html
```

## Test Coverage Breakdown

| Module | Statements | Branch | Functions | Lines |
|--------|-----------|---------|-----------|-------|
| **Overall** | 78.38% | 80.57% | 89.65% | 80.23% |
| controllers | 76.57% | 83.33% | 100% | 76.57% |
| models | 84.93% | 75.67% | 92.85% | 94.91% |
| routes | 100% | 100% | 100% | 100% |
| validators | 100% | 100% | 100% | 100% |

## Unit Tests

### validators.test.js (34 tests)
Tests for business logic validation:
- ✅ Auction validation (title, description, dates, price, duration)
- ✅ Land item validation (size, type, specifications)
- ✅ Vehicle item validation (make, model, year)
- ✅ Room code generation

### auctionModel.test.js (15 tests)
Tests for database operations with mocked Supabase:
- ✅ Create auction with room
- ✅ Read operations (getAll, getById, getByRoomCode, search)
- ✅ Update operations
- ✅ Delete (soft delete)
- ✅ Pagination and filtering

### itemModel.test.js (8 tests)
Tests for item CRUD operations:
- ✅ Create item
- ✅ Get by auction ID
- ✅ Update item
- ✅ Delete item
- ✅ Error handling

## Integration Tests

### auction.test.js (27 tests)
Tests for API endpoints using Supertest:
- ✅ POST /api/auctions - Create auction (8 tests)
- ✅ GET /api/auctions - List auctions (3 tests)
- ✅ GET /api/auctions/:id - Get single auction (2 tests)
- ✅ GET /api/auctions/room/:roomCode - Get by room code (2 tests)
- ✅ PUT /api/auctions/:id - Update auction (3 tests)
- ✅ DELETE /api/auctions/:id - Cancel auction (2 tests)
- ✅ PUT /api/auctions/:id/status - Update status (2 tests)
- ✅ GET /api/auctions/search - Search auctions (2 tests)
- ✅ Room operations (3 tests)

## Test Types

### 1. Positive Tests
Verify that valid inputs produce expected results.
```javascript
test('should create auction successfully with valid data', async () => {
  const response = await request(app)
    .post('/api/auctions')
    .send(validAuctionData);

  expect(response.status).toBe(201);
});
```

### 2. Negative Tests
Verify that invalid inputs are rejected with appropriate errors.
```javascript
test('should fail with invalid title', async () => {
  const response = await request(app)
    .post('/api/auctions')
    .send({ title: 'Hi' }); // Too short

  expect(response.status).toBe(400);
});
```

### 3. Boundary Tests
Test edge cases at boundaries.
```javascript
test('should pass if auction duration is exactly 1 hour', () => {
  const errors = validateAuction(auctionWith1HourDuration);
  expect(errors).toHaveLength(0);
});
```

### 4. Authorization Tests
Verify ownership and permissions.
```javascript
test('should fail if user is not the owner', async () => {
  const response = await request(app)
    .put('/api/auctions/auction-1')
    .set('x-user-id', 'different-user');

  expect(response.status).toBe(403);
});
```

## Mocking Strategy

### Supabase Client Mock
Location: `src/utils/__mocks__/supabase.js`
```javascript
const supabase = {
  from: jest.fn()
};
```

### Middleware Mocks
Auth middleware is mocked in integration tests to isolate API logic.

## Writing New Tests

### Template for Unit Tests
```javascript
describe('Feature Name', () => {
  test('should do something expected', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expectedOutput);
  });

  test('should handle error case', () => {
    expect(() => functionUnderTest(invalidInput)).toThrow();
  });
});
```

### Template for Integration Tests
```javascript
describe('POST /api/endpoint', () => {
  test('should succeed with valid data', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('x-user-id', 'test-user')
      .send(validData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Best Practices

1. **Clear Test Names**: Use descriptive names that explain what's being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **One Assertion Per Test**: Focus each test on a single behavior
4. **Clean Up**: Use `beforeEach` and `afterEach` for setup/teardown
5. **Mock External Dependencies**: Isolate units being tested
6. **Test Edge Cases**: Include boundary conditions and error scenarios

## Continuous Integration

Add to your CI/CD pipeline:
```yaml
# Example: GitHub Actions
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm test -- --coverage --coverageThreshold='{"global":{"statements":60}}'
```

## Troubleshooting

### Tests Failing
1. Check environment variables in `tests/setup.js`
2. Ensure all mocks are properly configured
3. Run tests individually to isolate failures

### Coverage Too Low
1. Add tests for uncovered branches
2. Test error handling paths
3. Add edge case tests

### Slow Tests
1. Use watch mode during development
2. Run only changed tests
3. Optimize mock setup

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain >60% coverage
4. Update this README if needed

---

**For detailed test case documentation, see:** `/TEST_CASE_DOCUMENTATION.md`

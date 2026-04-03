const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const request = require('supertest');

const testDbPath = path.join(__dirname, '..', '..', 'jest-finance.db');

process.env.JWT_SECRET = 'unit-test-jwt-secret-key-minimum-32-characters';
process.env.DATABASE_PATH = testDbPath;
process.env.NODE_ENV = 'test';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { resetDbForTesting, closeDb, getDb } = require('../../db');
const { app } = require('../../app');
const { BCRYPT_SALT_ROUNDS } = require('../utils/constants');

const FIXTURE_PASSWORD = 'fixture_pass_123456';

const FIXTURE_ISO_DATE = '2024-06-15';

const FIXTURE_INCOME_AMOUNT = 250;

async function seedFixtures() {
  const db = getDb();
  const hash = await bcrypt.hash(FIXTURE_PASSWORD, BCRYPT_SALT_ROUNDS);
  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password, role, status)
     VALUES (?, ?, ?, ?, 'active')`
  );
  insertUser.run('Admin', 'adminfixture@test.com', hash, 'admin');
  insertUser.run('Analyst', 'analystfixture@test.com', hash, 'analyst');
  insertUser.run('Viewer', 'viewerfixture@test.com', hash, 'viewer');
  const adminRow = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('adminfixture@test.com');
  const insertRecord = db.prepare(
    `INSERT INTO financial_records (amount, type, category, date, notes, created_by)
     VALUES (?, 'income', 'FixtureCat', ?, 'fixture notes', ?)`
  );
  insertRecord.run(FIXTURE_INCOME_AMOUNT, FIXTURE_ISO_DATE, adminRow.id);
}

describe('Finance API integration', () => {
  beforeAll(async () => {
    resetDbForTesting(testDbPath);
    await seedFixtures();
  });

  afterAll(() => {
    closeDb();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('POST /api/auth/login returns 200 for valid credentials and 401 for invalid', async () => {
    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewerfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);
    expect(ok.body.success).toBe(true);
    expect(ok.body.data.user.email).toBe('viewerfixture@test.com');

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewerfixture@test.com', password: 'wrong-password' })
      .expect(401);
  });

  it('POST /api/records returns 201 for admin and 403 for viewer', async () => {
    const adminAgent = request.agent(app);
    await adminAgent
      .post('/api/auth/login')
      .send({ email: 'adminfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    const createRes = await adminAgent
      .post('/api/records')
      .send({
        amount: 99.5,
        type: 'expense',
        category: 'ApiTest',
        date: FIXTURE_ISO_DATE,
        notes: 'admin create',
      })
      .expect(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.record.category).toBe('ApiTest');

    const viewerAgent = request.agent(app);
    await viewerAgent
      .post('/api/auth/login')
      .send({ email: 'viewerfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    await viewerAgent
      .post('/api/records')
      .send({
        amount: 10,
        type: 'income',
        category: 'Blocked',
        date: FIXTURE_ISO_DATE,
      })
      .expect(403);
  });

  it('GET /api/records returns paginated shape with expected fields', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ email: 'viewerfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    const res = await agent
      .get('/api/records')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(res.body.success).toBe(true);
    const { data: payload } = res.body;
    expect(Array.isArray(payload.data)).toBe(true);
    expect(typeof payload.total).toBe('number');
    expect(payload.page).toBe(1);
    expect(payload.limit).toBe(20);
    expect(typeof payload.totalPages).toBe('number');
    if (payload.data.length > 0) {
      const row = payload.data[0];
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('amount');
      expect(row).toHaveProperty('type');
      expect(row).toHaveProperty('category');
      expect(row).toHaveProperty('date');
    }
  });

  it('GET /api/dashboard/summary returns 200 for analyst and 403 for viewer', async () => {
    const analystAgent = request.agent(app);
    await analystAgent
      .post('/api/auth/login')
      .send({ email: 'analystfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    const ok = await analystAgent.get('/api/dashboard/summary').expect(200);
    expect(ok.body.success).toBe(true);
    expect(ok.body.data).toHaveProperty('totalIncome');
    expect(ok.body.data).toHaveProperty('totalExpenses');
    expect(ok.body.data).toHaveProperty('netBalance');
    expect(ok.body.data).toHaveProperty('recentActivity');

    const viewerAgent = request.agent(app);
    await viewerAgent
      .post('/api/auth/login')
      .send({ email: 'viewerfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    await viewerAgent.get('/api/dashboard/summary').expect(403);
  });

  it('DELETE /api/records/:id soft-deletes and excludes record from GET list', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ email: 'adminfixture@test.com', password: FIXTURE_PASSWORD })
      .expect(200);

    const created = await agent
      .post('/api/records')
      .send({
        amount: 42,
        type: 'expense',
        category: 'SoftDelete',
        date: FIXTURE_ISO_DATE,
      })
      .expect(201);
    const { id } = created.body.data.record;

    await agent.delete(`/api/records/${id}`).expect(200);

    const row = getDb()
      .prepare('SELECT deleted_at FROM financial_records WHERE id = ?')
      .get(id);
    expect(row.deleted_at).not.toBeNull();

    const list = await agent.get('/api/records').expect(200);
    const ids = list.body.data.data.map((r) => r.id);
    expect(ids).not.toContain(id);
  });
});

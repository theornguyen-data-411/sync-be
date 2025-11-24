const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const connectDB = require('../config/db');
const User = require('../model/User');
const Task = require('../model/Task');

describe('Task API', () => {
  let mongoServer;
  let authHeader;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.JWT_SECRET = 'test-secret';
    await connectDB(mongoServer.getUri());

    const user = await User.create({
      email: 'tester@example.com',
      password: 'hashed-password',
      authType: 'local'
    });

    userId = user._id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authHeader = `Bearer ${token}`;
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('POST /api/tasks creates a task with AI scoring and tagging', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({
        description: 'Deep work on architecture diagram',
        aiSchedule: true,
        startTime: '09:00',
        endTime: '11:00'
      });

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      description: 'Deep work on architecture diagram',
      tag: 'deep_work',
      tagSource: 'ai',
      energyZone: expect.any(String),
      rawScore: expect.any(Number),
      manaCost: expect.any(Number)
    });
  });

  test('GET /api/tasks lists tasks with filters', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({
        description: 'Team meeting about roadmap',
        aiSchedule: true
      });

    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/tasks?tag=communicating')
      .set('Authorization', authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.items[0].tag).toBe('communicating');
  });

  test('GET /api/tasks orders AI tasks before manual ones', async () => {
    const aiTask = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({
        description: 'Deep work session',
        aiSchedule: true
      });
    expect(aiTask.status).toBe(201);

    const manualTask = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({
        description: 'Manual chore list',
        aiSchedule: false,
        focusLevel: 'low',
        mentalLoad: 'low',
        movement: 'low',
        urgency: 'low',
        tag: 'admin',
        useAiTagging: false
      });
    expect(manualTask.status).toBe(201);

    const listRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.count).toBe(2);
    expect(listRes.body.items[0].aiSchedule).toBe(true);
    expect(listRes.body.items[1].aiSchedule).toBe(false);
  });

  test('POST /api/tasks/ai/preview returns scoring + tag', async () => {
    const previewRes = await request(app)
      .post('/api/tasks/ai/preview')
      .set('Authorization', authHeader)
      .send({
        description: 'Read new machine learning paper',
        useAiScoring: true,
        useAiTagging: true
      });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body).toMatchObject({
      manaCost: expect.any(Number),
      rawScore: expect.any(Number),
      energyZone: expect.any(String),
      tag: 'learning',
      tagSource: 'ai'
    });
  });
});


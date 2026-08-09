import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
describe('health endpoint',()=>{it('reports server and database health',async()=>{const response=await request(createApp({databaseCheck:async()=>true})).get('/timepass/api/health');expect(response.status).toBe(200);expect(response.body.database).toBe('ok');});});

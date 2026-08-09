import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
describe('health endpoint',()=>{it('reports server and database health without forcing HTTPS assets',async()=>{const response=await request(createApp({databaseCheck:async()=>true})).get('/timepass/api/health');expect(response.status).toBe(200);expect(response.body.database).toBe('ok');expect(response.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');});});

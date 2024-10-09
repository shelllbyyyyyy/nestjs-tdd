import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '@/app.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { STATUS } from '@/common/response/api';
import { Pool } from 'pg';
import { PG_CONNECTION } from '@/shared/constant';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let pool: Pool;

  const username = 'Luzma';
  const email = 'luzmacantik210@gmail.com';
  const password = '12345678';

  const dataLogin = {
    email,
    password,
  };

  const dataRegister = {
    username,
    email,
    password,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UserModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    pool = app.get<Pool>(PG_CONNECTION);

    await app.init();
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users 
WHERE email = 'luzmacantik210@gmail.com';`);

    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dataRegister);

    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty('message', 'Register Successfully');
    expect(response.body).toHaveProperty('code', HttpStatus.CREATED);
    expect(response.body).toHaveProperty('status', STATUS.CREATED);
    expect(response.body).toHaveProperty('data', response.body.data);
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(dataLogin);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toHaveProperty('message', 'Login Successfully');
    expect(response.body).toHaveProperty('code', HttpStatus.OK);
    expect(response.body).toHaveProperty('status', STATUS.OK);
    expect(response.body).toHaveProperty('data', response.body.data);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { MongoDuplicateKeyFilter } from '../../../../src/shared/filters/mongo-duplicate-key.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurações globais idênticas ao main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(
      new MongoDuplicateKeyFilter(httpAdapterHost.httpAdapter),
    );

    await app.init();
    mongoConnection = app.get(getConnectionToken());
  });

  afterAll(async () => {
    // Limpa a base de testes e fecha conexão
    if (mongoConnection) {
      await mongoConnection.dropDatabase();
    }
    await app.close();
  });

  const myValidClient = {
    name: 'João Silva',
    email: 'joao.silva.e2e.final@teste.com',
    document: '35655874075', // CPF válido
  };

  const anotherValidDoc = '11222333000181'; // CNPJ válido

  let createdClientId: string;

  describe('/clients (POST)', () => {
    it('deve criar um cliente com sucesso', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send(myValidClient)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe(myValidClient.name);
          createdClientId = res.body._id;
        });
    });

    it('deve retornar 400 para CPF inválido (matematicamente)', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          ...myValidClient,
          document: '11111111111',
          email: 'outro.e2e.final@email.com',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('CPF inválido');
        });
    });

    it('deve retornar 409 para email duplicado (MongoDuplicateKeyFilter)', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({ ...myValidClient, document: anotherValidDoc }) // Documento diferente mas EMAIL IGUAL
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already in use');
        });
    });
  });

  describe('/clients (GET)', () => {
    it('deve listar todos os clientes', () => {
      return request(app.getHttpServer())
        .get('/clients')
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('deve buscar um cliente por ID', () => {
      return request(app.getHttpServer())
        .get(`/clients/${createdClientId}`)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBe(createdClientId);
          expect(res.body.name).toBe(myValidClient.name);
        });
    });

    it('deve retornar 400 para ID inválido (MongoIdPipe)', () => {
      return request(app.getHttpServer())
        .get('/clients/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid id');
        });
    });
  });

  describe('/clients/:id (PATCH)', () => {
    it('deve atualizar parcialmente um cliente', () => {
      const updateData = { name: 'João Silva Updated' };
      return request(app.getHttpServer())
        .patch(`/clients/${createdClientId}`)
        .send(updateData)
        .expect(200)
        .then((res) => {
          expect(res.body.name).toBe(updateData.name);
        });
    });
  });

  describe('/clients/:id (DELETE)', () => {
    it('deve remover um cliente', () => {
      return request(app.getHttpServer())
        .delete(`/clients/${createdClientId}`)
        .expect(204);
    });

    it('deve retornar 404 ao buscar cliente removido', () => {
      return request(app.getHttpServer())
        .get(`/clients/${createdClientId}`)
        .expect(404);
    });
  });
});

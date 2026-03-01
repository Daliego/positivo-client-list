import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from '../../../src/modules/clients/clients.service';
import { Client } from '../../../src/modules/clients/clients.schema';

const mockClient = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Maria Silva',
  email: 'maria@empresa.com',
  document: '35655874075',
  created_at: new Date(),
  updated_at: new Date(),
};

function createMockModel() {
  const instance = {
    ...mockClient,
    save: jest.fn().mockResolvedValue(mockClient),
  };
  const model: any = jest.fn(() => instance);
  model.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockClient]),
    }),
  });
  model.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockClient),
  });
  model.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockClient),
  });
  model.findByIdAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockClient),
  });
  return model;
}

describe('ClientsService', () => {
  let createClientService: ClientsService;
  let model: any;

  beforeEach(async () => {
    model = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getModelToken(Client.name), useValue: model },
      ],
    }).compile();

    createClientService = module.get<ClientsService>(ClientsService);
  });

  describe('create', () => {
    it('deve criar um cliente', async () => {
      const newClientDto = {
        name: 'Maria Silva',
        email: 'maria@empresa.com',
        document: '35655874075',
      };
      const result = await createClientService.create(newClientDto);
      expect(result).toEqual(mockClient);
      expect(model).toHaveBeenCalledWith(newClientDto);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de clientes', async () => {
      const result = await createClientService.findAll();
      expect(result).toEqual([mockClient]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um cliente pelo ID', async () => {
      const result = await createClientService.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockClient);
      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(createClientService.findOne('507f1f77bcf86cd799439099')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('replace', () => {
    it('deve substituir um cliente', async () => {
      const dto = {
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        document: '35655874075',
      };
      const result = await createClientService.replace('507f1f77bcf86cd799439011', dto);
      expect(result).toEqual(mockClient);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true, runValidators: true },
      );
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const dto = {
        name: 'Test',
        email: 'test@test.com',
        document: '35655874075',
      };
      await expect(
        createClientService.replace('507f1f77bcf86cd799439099', dto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar campos parciais', async () => {
      const dto = { name: 'Maria Santos' };
      const result = await createClientService.update('507f1f77bcf86cd799439011', dto);
      expect(result).toEqual(mockClient);
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        createClientService.update('507f1f77bcf86cd799439099', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um cliente', async () => {
      await createClientService.remove('507f1f77bcf86cd799439011');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      model.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(createClientService.remove('507f1f77bcf86cd799439099')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

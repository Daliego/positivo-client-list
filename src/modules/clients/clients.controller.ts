import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MongoIdPipe } from '../../shared/pipes/mongo_id_validator.pipe';
import { DocumentPipe } from '../../shared/pipes/document.pipe';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { PatchClientDto } from './dto/patch-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './clients.schema';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo cliente',
    description:
      'Cria um novo cliente no sistema. O CPF/CNPJ é validado matematicamente e deve ser único.',
  })
  @ApiBody({
    type: CreateClientDto,
    examples: {
      cpf: {
        summary: 'Cliente pessoa física (CPF)',
        value: {
          name: 'Maria Silva',
          email: 'maria@empresa.com',
          document: '35655874075',
        },
      },
      cnpj: {
        summary: 'Cliente pessoa jurídica (CNPJ)',
        value: {
          name: 'Tech Solutions LTDA',
          email: 'contato@techsolutions.com.br',
          document: '11222333000181',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: Client,
    description: 'Cliente criado com sucesso',
    content: {
      'application/json': {
        example: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Maria Silva',
          email: 'maria@empresa.com',
          document: '35655874075',
          created_at: '2026-03-01T19:00:00.000Z',
          updated_at: '2026-03-01T19:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos (validação do body ou CPF/CNPJ inválido)',
    content: {
      'application/json': {
        examples: {
          validacao_campos: {
            summary: 'Campos obrigatórios ausentes',
            value: {
              statusCode: 400,
              message: [
                'name should not be empty',
                'name must be a string',
                'email must be an email',
                'document must contain only digits and be 11 (CPF) or 14 (CNPJ) characters long',
              ],
              error: 'Bad Request',
            },
          },
          cpf_invalido: {
            summary: 'CPF matematicamente inválido',
            value: {
              statusCode: 400,
              message: 'CPF inválido',
              error: 'Bad Request',
            },
          },
          cnpj_invalido: {
            summary: 'CNPJ matematicamente inválido',
            value: {
              statusCode: 400,
              message: 'CNPJ inválido',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email ou documento já cadastrado',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'email already in use',
          error: 'Conflict',
        },
      },
    },
  })
  create(@Body(DocumentPipe) dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description:
      'Retorna uma lista com todos os clientes cadastrados, ordenados por data de criação (mais recentes primeiro).',
  })
  @ApiOkResponse({
    type: [Client],
    description: 'Lista de clientes retornada com sucesso',
    content: {
      'application/json': {
        example: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Maria Silva',
            email: 'maria@empresa.com',
            document: '35655874075',
            created_at: '2026-03-01T19:00:00.000Z',
            updated_at: '2026-03-01T19:00:00.000Z',
          },
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Tech Solutions LTDA',
            email: 'contato@techsolutions.com.br',
            document: '11222333000181',
            created_at: '2026-03-01T18:30:00.000Z',
            updated_at: '2026-03-01T18:30:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description:
      'Retorna os dados de um cliente específico pelo seu ObjectId do MongoDB.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do MongoDB (24 caracteres hexadecimais)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    type: Client,
    description: 'Cliente encontrado',
    content: {
      'application/json': {
        example: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Maria Silva',
          email: 'maria@empresa.com',
          document: '35655874075',
          created_at: '2026-03-01T19:00:00.000Z',
          updated_at: '2026-03-01T19:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Client not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido (não é um ObjectId válido)',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Invalid id',
          error: 'Bad Request',
        },
      },
    },
  })
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Substituir cliente (PUT)',
    description:
      'Substitui todos os campos de um cliente existente. Todos os campos são obrigatórios.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do MongoDB (24 caracteres hexadecimais)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: PatchClientDto,
    examples: {
      exemplo: {
        summary: 'Substituir todos os campos',
        value: {
          name: 'Maria Silva Santos',
          email: 'maria.santos@empresa.com',
          document: '35655874075',
        },
      },
    },
  })
  @ApiOkResponse({
    type: Client,
    description: 'Cliente substituído com sucesso (objeto completo atualizado)',
    content: {
      'application/json': {
        example: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Maria Silva Santos',
          email: 'maria.santos@empresa.com',
          document: '35655874075',
          created_at: '2026-03-01T19:00:00.000Z',
          updated_at: '2026-03-01T19:30:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Client not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou ID inválido',
    content: {
      'application/json': {
        examples: {
          id_invalido: {
            summary: 'ID inválido',
            value: {
              statusCode: 400,
              message: 'Invalid id',
              error: 'Bad Request',
            },
          },
          cpf_invalido: {
            summary: 'CPF/CNPJ inválido',
            value: {
              statusCode: 400,
              message: 'CPF inválido',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email ou documento já em uso por outro cliente',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'email already in use',
          error: 'Conflict',
        },
      },
    },
  })
  patchClient(
    @Param('id', MongoIdPipe) id: string,
    @Body(DocumentPipe) dto: PatchClientDto,
  ) {
    return this.clientsService.replace(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar campos do cliente (PATCH)',
    description:
      'Atualiza parcialmente os dados de um cliente. Apenas os campos enviados serão atualizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do MongoDB (24 caracteres hexadecimais)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateClientDto,
    examples: {
      atualizar_nome: {
        summary: 'Atualizar apenas o nome',
        value: {
          name: 'Maria Silva Santos',
        },
      },
      atualizar_email: {
        summary: 'Atualizar apenas o email',
        value: {
          email: 'novo.email@empresa.com',
        },
      },
      atualizar_varios: {
        summary: 'Atualizar nome e email',
        value: {
          name: 'Maria S. Santos',
          email: 'maria.s.santos@empresa.com',
        },
      },
    },
  })
  @ApiOkResponse({
    type: Client,
    description: 'Campos do cliente atualizados com sucesso',
    content: {
      'application/json': {
        example: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Maria Silva Santos',
          email: 'maria@empresa.com',
          document: '35655874075',
          created_at: '2026-03-01T19:00:00.000Z',
          updated_at: '2026-03-01T19:45:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Client not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou ID inválido',
    content: {
      'application/json': {
        examples: {
          id_invalido: {
            summary: 'ID inválido',
            value: {
              statusCode: 400,
              message: 'Invalid id',
              error: 'Bad Request',
            },
          },
          cpf_invalido: {
            summary: 'CPF/CNPJ inválido',
            value: {
              statusCode: 400,
              message: 'CPF inválido',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email ou documento já em uso por outro cliente',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'document already in use',
          error: 'Conflict',
        },
      },
    },
  })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body(DocumentPipe) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remover cliente',
    description:
      'Remove permanentemente um cliente do sistema. Retorna 204 sem conteúdo em caso de sucesso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do MongoDB (24 caracteres hexadecimais)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiNoContentResponse({
    description: 'Cliente removido com sucesso (sem conteúdo no body)',
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Client not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Invalid id',
          error: 'Bad Request',
        },
      },
    },
  })
  remove(@Param('id', MongoIdPipe) id: string) {
    return this.clientsService.remove(id);
  }
}

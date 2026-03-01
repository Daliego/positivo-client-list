# API de Clientes — NestJS + MongoDB + Docker

Opa espero que tenham gostado do projeto

Os passos pra rodar ele seguem a seguir, sim, eu usei IA no projeto, mas eu sei o que eu gerei, não se preocupem.

> **Nota:** Tudo foi feito em português aqui no readme, para facilitar a leitura dos avaliadores.

## Sobre o Projeto

API RESTful para gerenciamento de clientes, construída com **NestJS**, **MongoDB** e containerizada com **Docker**.

> **Nota sobre uso de IA:** O boilerplate inicial do projeto e a view HTML de listagem de clientes foram gerados com auxílio de **Inteligência Artificial**, esses foram requisitos que não foram solicitados no documento de requisitos.
---

## Tecnologias

| Tecnologia              | Versão | Propósito                      |
| ----------------------- | ------ | ------------------------------ |
| NestJS                  | 11.x   | Framework backend              |
| MongoDB                 | latest | Banco de dados NoSQL           |
| Mongoose                | 10.x   | ODM para MongoDB               |
| Docker / Docker Compose | —      | Containerização                |
| Swagger (OpenAPI)       | 3.0    | Documentação interativa da API |
| class-validator         | —      | Validação de DTOs              |

---

## Módulos Implementados

### Módulo de Clientes (`src/modules/clients/`)

CRUD completo de clientes com as seguintes operações:

| Método | Rota           | Descrição                            |
| ------ | -------------- | ------------------------------------ |
| POST   | `/clients`     | Criar cliente                        |
| GET    | `/clients`     | Listar todos os clientes             |
| GET    | `/clients/:id` | Buscar cliente por ID                |
| PUT    | `/clients/:id` | Substituir cliente (todos os campos) |
| PATCH  | `/clients/:id` | Atualizar campos parciais            |
| DELETE | `/clients/:id` | Remover cliente                      |

**Validações implementadas:**

- **class-validator**: `@IsString`, `@IsEmail`, `@IsNotEmpty`, `@Matches` nos DTOs
- **DocumentPipe**: Validação matemática de CPF (11 dígitos) e CNPJ (14 dígitos) via algoritmo oficial dos dígitos verificadores
- **MongoIdPipe**: Validação de ObjectId do MongoDB nos parâmetros de rota
- **MongoDuplicateKeyFilter**: Filtro global que captura erros de chave duplicada (code 11000) e retorna HTTP 409

### View de Listagem (`src/views/`)

Página HTML com tema escuro acessível em `GET /view/clients`. Busca dados da API REST automaticamente a cada 60 segundos. Além de também oferecer a opção de criar clientes, não implementei o resto do CRUD, mas acho que o projeto está bem feito.

### Shared (`src/shared/`)

- **Pipes**: `MongoIdPipe`, `DocumentPipe`
- **Filters**: `MongoDuplicateKeyFilter`

### Helpers (`src/helpers/`)

Essa parte aqui vai ter seu momento de explicação durante a apresentação do projeto 

- `validateCpf()` — Algoritmo de validação de CPF
- `validateCnpj()` — Algoritmo de validação de CNPJ

---

## Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados

### Desenvolvimento (com Docker)

```bash
# Puxe as variáveis de ambiente
cp .env.example .env

# Suba os containers
docker-compose up --build
```

Isso irá:

1. Subir o container do MongoDB
2. Subir a aplicação NestJS em modo debug (porta 9229)
3. A API estará disponível em `http://localhost:3000`
4. A documentação Swagger em `http://localhost:3000/docs`
5. A view de clientes em `http://localhost:3000/view/clients`

### Sem Docker

```bash
npm install
npm run start:dev

# Mas vai ter quer ter um banco de dados local MongoDB rodando
```

---

## Variáveis de Ambiente

Configuradas no arquivo `.env`:

| Variável         | Descrição          | Padrão        |
| ---------------- | ------------------ | ------------- |
| `SERVER_PORT`    | Porta da aplicação | `3000`        |
| `NODE_ENV`       | Ambiente           | `development` |
| `MONGO_PORT`     | Porta do MongoDB   | `27017`       |
| `MONGO_HOSTNAME` | Host do MongoDB    | `mongo`       |
| `MONGO_DATABASE` | Nome do banco      | `clientsdb`   |
| `MONGO_USERNAME` | Usuário do MongoDB | —             |
| `MONGO_PASSWORD` | Senha do MongoDB   | —             |

---

## Testes

```bash
npm run test        # Testes unitários
npm run test:e2e    # Testes end-to-end
npm run test:cov    # Cobertura de testes
```

---


### Notas

- Eu sei muito bem como o controller ficou ruim de ler, mas eu acabei desistindo de implementar uma notation para poder remove essa documentação de diretamente do controller. Eu teria finalizado isso em uma implentação posterior.

- Espero que o sistema tenha ficado do agrado do avaliador, obrigado.


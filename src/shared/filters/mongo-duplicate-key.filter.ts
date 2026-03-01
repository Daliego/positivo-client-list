import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/**
 * Exception Filter global que intercepta erros de chave duplicada do MongoDB (code 11000).
 * Transforma o erro em uma resposta HTTP 409 Conflict com o nome do campo duplicado.
 * Registrado globalmente em main.ts — elimina a necessidade de try/catch manual nos services.
 *
 * Extende BaseExceptionFilter para que exceções HTTP (BadRequest, NotFound, etc.)
 * continuem sendo tratadas normalmente pelo NestJS.
 */
@Catch()
export class MongoDuplicateKeyFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Erro de chave duplicada do MongoDB → 409 Conflict
    if (exception?.code === 11000) {
      const keys = Object.keys(
        exception?.keyPattern || exception?.keyValue || {},
      );
      const field = keys[0] || 'field';
      const conflict = new ConflictException(`${field} already in use`);
      super.catch(conflict, host);
      return;
    }

    // Todos os outros erros (HttpException, etc.) → handler padrão do NestJS
    super.catch(exception, host);
  }
}

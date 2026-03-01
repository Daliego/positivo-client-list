import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validateCpf, validateCnpj } from '../../helpers';

/**
 * Pipe que valida se o campo `document` do body é um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.
 * Deve ser usado após a validação do class-validator (que já garante que são apenas dígitos).
 */
@Injectable()
export class DocumentPipe implements PipeTransform {
  transform(value: any): any {
    const doc: string | undefined = value?.document;

    // Se não tem document no body, deixa passar, pq vai lançar o erro posteriormente
    if (!doc) return value;

    if (doc.length === 11) {
      console.log(doc);
      if (!validateCpf(doc)) {
        throw new BadRequestException('CPF inválido');
      }
    } else if (doc.length === 14) {
      if (!validateCnpj(doc)) {
        throw new BadRequestException('CNPJ inválido');
      }
      // Coloquei uma valicação extra
    } else {
      throw new BadRequestException(
        'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)',
      );
    }

    return value;
  }
}

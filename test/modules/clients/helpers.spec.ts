import { validateCpf } from '../../../src/helpers/cpf-validator';
import { validateCnpj } from '../../../src/helpers/cnpj-validator';

describe('validateCpf', () => {
  it('deve aceitar CPF válido (356.558.740-75)', () => {
    expect(validateCpf('35655874075')).toBe(true);
  });

  it('deve aceitar outro CPF válido', () => {
    expect(validateCpf('52998224725')).toBe(true);
  });

  it('deve rejeitar CPF com dígitos iguais', () => {
    expect(validateCpf('11111111111')).toBe(false);
    expect(validateCpf('00000000000')).toBe(false);
  });

  it('deve rejeitar CPF com dígito verificador errado', () => {
    expect(validateCpf('35655874076')).toBe(false);
  });

  it('deve rejeitar string com tamanho errado', () => {
    expect(validateCpf('123')).toBe(false);
    expect(validateCpf('123456789012')).toBe(false);
  });
});

describe('validateCnpj', () => {
  it('deve aceitar CNPJ válido (11.222.333/0001-81)', () => {
    expect(validateCnpj('11222333000181')).toBe(true);
  });

  it('deve aceitar outro CNPJ válido', () => {
    expect(validateCnpj('11444777000161')).toBe(true);
  });

  it('deve rejeitar CNPJ com dígitos iguais', () => {
    expect(validateCnpj('11111111111111')).toBe(false);
    expect(validateCnpj('00000000000000')).toBe(false);
  });

  it('deve rejeitar CNPJ com dígito verificador errado', () => {
    expect(validateCnpj('11222333000182')).toBe(false);
  });

  it('deve rejeitar string com tamanho errado', () => {
    expect(validateCnpj('1234567890')).toBe(false);
    expect(validateCnpj('123456789012345')).toBe(false);
  });
});

/**
 * Valida se uma string de 14 dígitos é um CNPJ válido.
 * Aplica o algoritmo oficial de verificação dos dois dígitos verificadores.
 */
export function validateCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;

  // Rejeita CNPJs com todos os dígitos iguais (ex.: 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const digits = cnpj.split('').map(Number);

  // Pesos para o primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== digits[12]) return false;

  // Pesos para o segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== digits[13]) return false;

  return true;
}

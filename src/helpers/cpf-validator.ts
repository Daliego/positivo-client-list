/**
 * Valida se uma string de 11 dígitos é um CPF válido.
 * Aplica o algoritmo oficial de verificação dos dois dígitos verificadores.
 */
export function validateCpf(cpf: string): boolean {
  if (cpf.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais (ex.: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split('').map(Number);

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== digits[9]) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== digits[10]) return false;

  return true;
}

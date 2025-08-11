import { Decimal } from '@prisma/client/runtime/library';

/**
 * Utilitaires pour gérer les conversions entre Decimal et number
 */

/**
 * Convertit un Decimal en number de manière sécurisée
 */
export function decimalToNumber(decimal: Decimal | number | string | null | undefined): number {
  if (decimal === null || decimal === undefined) {
    return 0;
  }
  
  if (typeof decimal === 'number') {
    return decimal;
  }
  
  if (typeof decimal === 'string') {
    return parseFloat(decimal) || 0;
  }
  
  // Si c'est un Decimal de Prisma
  return Number(decimal.toString());
}

/**
 * Convertit un number en Decimal pour Prisma
 */
export function numberToDecimal(value: number | string | null | undefined): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0);
  }
  
  return new Decimal(value.toString());
}

/**
 * Formate un montant en devise (TND par défaut)
 */
export function formatCurrency(
  amount: Decimal | number | string | null | undefined, 
  currency: string = 'TND'
): string {
  const numericAmount = decimalToNumber(amount);
  
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Arrondit un montant à 2 décimales
 */
export function roundToTwoDecimals(amount: Decimal | number | string | null | undefined): number {
  const numericAmount = decimalToNumber(amount);
  return Math.round(numericAmount * 100) / 100;
}

/**
 * Calcule le total d'un tableau de montants
 */
export function sumAmounts(amounts: (Decimal | number | string | null | undefined)[]): number {
  return amounts.reduce((sum: number, amount) => sum + decimalToNumber(amount), 0);
}

/**
 * Convertit un objet contenant des Decimal en objet avec des numbers
 */
export function convertDecimalFields<T extends Record<string, any>>(
  obj: T,
  decimalFields: (keyof T)[]
): T {
  const converted = { ...obj };
  
  decimalFields.forEach(field => {
    if (converted[field] !== undefined) {
      converted[field] = decimalToNumber(converted[field]) as T[keyof T];
    }
  });
  
  return converted;
}

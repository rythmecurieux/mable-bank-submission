import type { Money } from '../domain/Money.js';

export function formatMoney(money: Money): string {
  return money.format();
}

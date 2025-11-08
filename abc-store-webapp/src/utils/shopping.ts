export const formatCurrency = (amount: number, locale = 'en-US', currency = 'USD') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatToCurrency = (value: number) => {
  return new Intl.NumberFormat("gh-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

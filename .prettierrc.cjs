module.exports = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: ["^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
};

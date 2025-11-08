const config = {
  // schemaFile: 'https://localhost:7198/openapi/v1.json',
  schemaFile: './openapi-schema.json',
  apiFile: './src/store/api/baseApi.ts',
  apiImport: 'baseSplitApi',
  outputFile: './src/store/api/abcApi.ts',
  exportName: 'abcApi',
  hooks: true,
};

module.exports = config;

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // If apiFetch is used but not imported
  const usesApiFetch = root.find(j.Identifier, { name: 'apiFetch' }).size() > 0;
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: './src/utils/apiClient' }
  }).size() > 0;

  if (usesApiFetch && !hasImport) {
    root.get().node.program.body.unshift(
      j.importDeclaration(
        [j.importSpecifier(j.identifier('apiFetch'))],
        j.literal('./src/utils/apiClient')
      )
    );
  }
  return root.toSource();
};

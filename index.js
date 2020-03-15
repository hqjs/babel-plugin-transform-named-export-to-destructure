module.exports = function ({ types: t }) {
  return {
    visitor: {
      ExportNamedDeclaration(nodePath) {
        const { specifiers, source } = nodePath.node;
        if (!source) return;
        const importSpecifiers = [];
        for (const specifier of specifiers) {
          const importName = nodePath.scope.generateUidIdentifierBasedOnNode('exportDestructure');
          const importSpecifier = specifier.local ?
			t.importSpecifier(importName, specifier.local) :
			t.importNamespaceSpecifier(importName);
          importSpecifiers.push(importSpecifier);
          const exportDecl = t.exportNamedDeclaration(
            t.variableDeclaration('const', [
              t.variableDeclarator(specifier.exported, importName)
            ]),
            []
          );
          console.log(exportDecl);
          nodePath.insertAfter(exportDecl);
        }
        console.log(source, importSpecifiers);
        const importDecl = t.importDeclaration(importSpecifiers, source);
        nodePath.replaceWith(importDecl);
      }
    }
  };
};

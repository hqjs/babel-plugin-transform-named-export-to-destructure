const importVisitor = (t, add, src, name, start) => ({
  ImportDeclaration(nodePath) {
    const { specifiers, source } = nodePath.node;
    if (source.value != src) return;
    if (nodePath.node.start > start) {
      const specs = specifiers.filter(spec => name != spec.local.name);
      if (specs.length > 0) nodePath.node.specifiers = specs;
      else nodePath.remove();
    } else add.value = false;
  }
});

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
          const add = {value: true};
          const program = nodePath.findParent(p => p.isProgram());
          program.traverse(importVisitor(t, add, source.value, specifier.exported.name, nodePath.node.start));
          if (add.value) importSpecifiers.push(importSpecifier);
          const exportDecl = t.exportNamedDeclaration(
            t.variableDeclaration('const', [
              t.variableDeclarator(specifier.exported, importName)
            ]),
            []
          );
          nodePath.insertAfter(exportDecl);
        }
        const importDecl = t.importDeclaration(importSpecifiers, source);
        nodePath.replaceWith(importDecl);
      }
    }
  };
};

const importVisitor = (t, add, {src, name, start, exportDecl, importName}) => ({
  ImportDeclaration(nodePath) {
    const { specifiers, source } = nodePath.node;
    if (source.value != src) return;
    if (nodePath.node.start > start) {
      const specs = specifiers.filter(spec => name != spec.local.name);
      if (specs.length > 0) nodePath.node.specifiers = specs;
      else nodePath.remove();
    } else {
      const specs = specifiers.map(spec => spec.local.name === name ? t.importSpecifier(importName, spec.local) : spec);
      nodePath.node.specifiers = specs;
      nodePath.insertAfter(exportDecl)
      add.value = false;
    }
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
          const exportDecl = t.exportNamedDeclaration(
            t.variableDeclaration('const', [
              t.variableDeclarator(specifier.exported, importName)
            ]),
            []
          );
          const add = {value: true};
          const program = nodePath.findParent(p => p.isProgram());
          program.traverse(importVisitor(t, add, {
            src: source.value,
            name: specifier.exported.name,
            start: nodePath.node.start,
            exportDecl,
            importName,
          }));
          if (add.value) {
            importSpecifiers.push(importSpecifier);
            nodePath.insertAfter(exportDecl);
          }
        }
        if (importSpecifiers.length > 0) nodePath.replaceWith(t.importDeclaration(importSpecifiers, source));
        else nodePath.remove();
      }
    }
  };
};

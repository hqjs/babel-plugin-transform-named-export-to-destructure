const sameImport = (t, spec, name, localName) => name === spec.local.name &&
  (
    t.isImportNamespaceSpecifier(spec) ?
      localName == null :
      t.isImportDefaultSpecifier(spec) ?
        localName === 'default' :
        localName === spec.imported.name
  );

const importVisitor = (t, add, {src, name, localName, start, exportDecl, importName}) => ({
  ImportDeclaration(nodePath) {
    const { specifiers, source } = nodePath.node;
    if (source.value != src || specifiers.every(spec => !sameImport(t, spec, name, localName))) return;
    if (nodePath.node.start > start) {
      const specs = specifiers.filter(spec => !sameImport(t, spec, name, localName));
      if (specs.length > 0) nodePath.node.specifiers = specs;
      else nodePath.remove();
    } else {
      const specs = specifiers.map(spec => sameImport(t, spec, name, localName) ?
        t.isImportNamespaceSpecifier(spec) ?
          t.importNamespaceSpecifier(importName) :
          t.importSpecifier(importName, spec.imported || t.identifier('default')) :
        spec
      );
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
          const exportDecl = specifier.exported.name === 'default' ?
            t.exportDefaultDeclaration(importName) :
            t.exportNamedDeclaration(
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
            localName: specifier.local ? specifier.local.name : null,
            start: nodePath.node.start,
            exportDecl,
            importName,
          }));
          if (add.value) {
            importSpecifiers.push(importSpecifier);
            nodePath.insertAfter(exportDecl);
          }
        }
        if (importSpecifiers.length > 0) {
          nodePath.replaceWith(t.importDeclaration(importSpecifiers, source));
        } else nodePath.remove();
      }
    }
  };
};

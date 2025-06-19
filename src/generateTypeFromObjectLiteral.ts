import * as ts from "typescript";

const generetedType = (source: ts.Node) => {
  switch (source.kind) {
    case ts.SyntaxKind.StringLiteral:
      return "string";
    case ts.SyntaxKind.NumericLiteral:
      return "number";
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return "boolean";
    case ts.SyntaxKind.UndefinedKeyword:
      return "undefined";
    case ts.SyntaxKind.NullKeyword:
      return "null";
    case ts.SyntaxKind.BigIntLiteral:
      return "bigint";
    case ts.SyntaxKind.ArrayLiteralExpression:
      if (ts.isArrayLiteralExpression(source)) return arrayHandler(source);
    case ts.SyntaxKind.ObjectLiteralExpression:
      if (ts.isObjectLiteralExpression(source)) return objectHandler(source);
  }

  if (ts.isIdentifier(source) && source.text === "undefined") return "undefined";

  if (
    ts.isCallExpression(source) &&
    ts.isIdentifier(source.expression) &&
    source.expression.text.includes("Symbol")
  )
    return "symbol";

  if (ts.isFunctionExpression(source) || ts.isArrowFunction(source)) {
    return "(params: unknown) => void";
  }

  return "any";
};

function objectHandler(objectLiteral: ts.ObjectLiteralExpression) {
  const lines = objectLiteral.properties.map((prop) => {
    if (ts.isMethodDeclaration(prop)) {
      const name = prop.name?.getText();
      return `${name}(unknown):unknown;`;
    }

    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) {
      return "";
    }
    const key = prop.name.text;

    let type: unknown = generetedType(prop.initializer);

    return `  ${key}: ${type};`;
  });

  return `{\n${lines.join("\n")}\n}`;
}

function arrayHandler(arrayLiteral: ts.ArrayLiteralExpression) {
  const result: unknown[] = [];
  arrayLiteral.forEachChild((item) => {
    result.push(generetedType(item));
  });

  return `[${result}]`;
}

export function generateTypeFromObjectLiteral(sourceText: string): string | void {
  const wrapped = `const temp = ${sourceText}`;
  const sourceFile = ts.createSourceFile("temp.ts", wrapped, ts.ScriptTarget.Latest, true);

  let objectLiteral: ts.ObjectLiteralExpression | undefined;

  const visit = (node: ts.Node) => {
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        objectLiteral = declaration.initializer;
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (!objectLiteral) return;
  return `type GeneratedType = ${objectHandler(objectLiteral)}`;
}

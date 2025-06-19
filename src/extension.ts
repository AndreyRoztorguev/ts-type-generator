// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { generateTypeFromObjectLiteral } from "./generateTypeFromObjectLiteral";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "typegenerator" is now active!');

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider("*", new MyCodeActionProvider(), {
      providedCodeActionKinds: MyCodeActionProvider.providedCodeActionKinds,
    })
  );

  // // The command has been defined in the package.json file
  // // Now provide the implementation of the command with registerCommand
  // // The commandId parameter must match the command field in package.json
  // const disposable = vscode.commands.registerCommand("typegenerator.helloWorld", () => {
  //   // The code you place here will be executed every time your command is executed
  //   // Display a message box to the user
  //   vscode.window.showInformationMessage("! Hello World from typegenerator!");
  // });

  // context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log('your extension "typegenerator" is not active!');
}

class MyCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const selectedText = document.getText(range);

    if (!selectedText) return;

    const fix = new vscode.CodeAction(
      "Transform to Typescript Type",
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();

    const text = generateTypeFromObjectLiteral(selectedText);

    if (!text) return;

    fix.edit.insert(document.uri, range.end, `\n\n${text}`);

    fix.isPreferred = true;

    return [fix];
  }
}

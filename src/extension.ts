import * as vscode from 'vscode'
const open = require('opn')
const fs = require('fs')

const ST_CMD = 'subl'

async function askUserForPath(workspaceFolders: readonly vscode.WorkspaceFolder[]) {
    let items = workspaceFolders.map((item: { name: any }) => item.name)
    let selected = await vscode.window.showQuickPick(items)

    if (selected) {
        let folder = workspaceFolders.find((item) => item.name === selected)
        if (folder) return folder.uri.fsPath
    }
    return null
}

async function findRelevantPath() {
    let activeTextEditor = vscode.window.activeTextEditor
    let file = activeTextEditor && activeTextEditor.document.fileName
    if (fs.existsSync(file)) {
        return file
    }

    let workspaceFolders = vscode.workspace.workspaceFolders
    if (workspaceFolders == undefined) return
    if (workspaceFolders.length === 1) {
        return workspaceFolders[0].uri.fsPath
    } else {
        return await askUserForPath(workspaceFolders)
    }
}

function getAppName() {
    if (process.platform == 'darwin') {
        return 'Sublime Test'
    } else {
        return ST_CMD
    }
}

function getCursorPosition(): vscode.Position {
    let posZero = new vscode.Position(0, 0)

    const editor = vscode.window.activeTextEditor
    if (!editor) return posZero

    const selections = editor.selections
    if (selections.length === 0) return posZero

    let cursor = selections[0].active
    let line: number = cursor.line
    let character: number = cursor.character

    return new vscode.Position(line, character)
}

async function openInSublimeMerge() {
    try {
        const relevantPath = await findRelevantPath()
        if (!relevantPath) return

        let pos = getCursorPosition()
        // Filenames may be given a :line or :line:column suffix to open at a specific location.
        let target = `${relevantPath}:${pos.line + 1}:${pos.character + 1}`
        await open(target, { app: getAppName() })
    } catch (err) {
        vscode.window.showErrorMessage('err: ' + err)
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('openInSublimeText.open', openInSublimeMerge)
    context.subscriptions.push(disposable)
}

export function deactivate() {}

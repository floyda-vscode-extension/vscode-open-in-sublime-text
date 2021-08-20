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

async function openInSublimeMerge() {
    try {
        const relevantPath = await findRelevantPath()
        if (!relevantPath) return
        await open(relevantPath, { app: getAppName() })
    } catch (err) {
        console.error(err)
        vscode.window.showErrorMessage(err)
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('openInSublimeText.open', openInSublimeMerge)
    context.subscriptions.push(disposable)
}

export function deactivate() {}

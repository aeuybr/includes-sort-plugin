import * as vscode from 'vscode';

/**
 * Сортирует инклюды в открытом документе.
 *
 * @remarks
 * Находит первый блок #include, удаляет дубликаты
 * и сортирует заголовки по алфавиту.
 */
export function sortIncludes() {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage("Файл не открыт!");
        return;
    }

    let document = editor.document;
    let text = document.getText();
    let lines = text.split('\n'); 

    let first_line = -1;
    let last_line = -1;

    for (let i = 0; i < lines.length; i++) {
        let cur_line = lines[i].trim(); 
        
        if (cur_line.startsWith("#include <")) {
            if (first_line === -1) {
                first_line = i;
            }
            last_line = i;
        } else if (first_line !== -1 && cur_line !== "") {
            break;
        }
    }

    if (first_line === -1) {
        vscode.window.showInformationMessage("Нет инклюдов для сортировки");
        return;
    }

    let includes: string[] = []; 

    for (let i = first_line; i <= last_line; i++) {
        let cur_line = lines[i].trim();
        if (cur_line.startsWith("#include <")) {
            let startIndex = 10;
            let endIndex = cur_line.indexOf(">"); 
            if (endIndex !== -1) {
                let name = cur_line.substring(startIndex, endIndex);
                includes.push(name);
            }
        }
    }

    let unique_includes: string[] = [];
    for (let i = 0; i < includes.length; i++) {
        let duplicate = false;
        for (let j = 0; j < unique_includes.length; j++) {
            if (includes[i] === unique_includes[j]) {
                duplicate = true;
                break;
            }
        }
        if (duplicate === false) {
            unique_includes.push(includes[i]);
        }
    }

    unique_includes.sort();

    let new_lines: string[] = [];
    for (let i = 0; i < unique_includes.length; i++) {
        new_lines.push("#include <" + unique_includes[i] + ">");
    }

    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(first_line, 0, last_line, lines[last_line].length);
    
    let new_text = new_lines.join('\n'); 
    edit.replace(document.uri, range, new_text);
    
    vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage("Отсортировано!");
}

/**
 * @brief Регистрирует команду расширения в VS Code.
 * @param context Контекст расширения.
 */
export function activate(context: vscode.ExtensionContext) {
    let command = vscode.commands.registerCommand('cpp-sort-includes.sort', sortIncludes);
    context.subscriptions.push(command);
}

/**
 * Выполняет деактивацию расширения.
 */
export function deactivate() {}
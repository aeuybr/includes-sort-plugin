import * as vscode from 'vscode';

/**
 * Сортирует инклюды в открытом документе.
 *
 * @remarks
 * Находит первый блок #include, удаляет дубликаты
 * и сортирует заголовки по алфавиту.
 */
export function sortIncludes() {
    // Получаем открытое окно с текстом
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage("Файл не открыт!");
        return;
    }

    let document = editor.document;
    let text = document.getText();
    let lines = text.split('\n'); // разбиваем на строки

    let first_line = -1;
    let last_line = -1;

    // Ищем где начинается и заканчивается блок инклюдов
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim(); // убираем пробелы по краям
        
        // Проверяем, что строка начинается с #include <
        if (line.startsWith("#include <")) {
            if (first_line === -1) {
                first_line = i;
            }
            last_line = i;
        } else if (first_line !== -1 && line !== "") {
            // Если блок начался, но пошла другая строка — останавливаемся
            break;
        }
    }

    // Если инклюдов нет
    if (first_line === -1) {
        vscode.window.showInformationMessage("Нет инклюдов для сортировки");
        return;
    }

    let includes: string[] = []; // сюда собираем сами названия (например iostream)

    // Вытаскиваем названия из строк
    for (let i = first_line; i <= last_line; i++) {
        let line = lines[i].trim();
        if (line.startsWith("#include <")) {
            let startIndex = 10; // длина слова "#include <" (10 символов)
            let endIndex = line.indexOf(">"); // ищем закрывающую скобку
            if (endIndex !== -1) {
                let name = line.substring(startIndex, endIndex);
                includes.push(name);
            }
        }
    }

    // Убираем дубликаты 
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

    // Сортируем по алфавиту (встроенный метод)
    unique_includes.sort();

    // Собираем обратно в строки
    let new_lines: string[] = [];
    for (let i = 0; i < unique_includes.length; i++) {
        new_lines.push("#include <" + unique_includes[i] + ">");
    }

    // Записываем изменения в файл
    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(first_line, 0, last_line, lines[last_line].length);
    
    let new_text = new_lines.join('\n'); // склеиваем массив обратно в текст
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
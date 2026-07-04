# Open External Terminal

VS Code extension that adds Explorer context-menu commands to open the selected file or folder in an external terminal.

## Features

- Right-click a file or folder in Explorer and choose `Open in System Terminal` / `使用系统终端打开`.
- Right-click a file or folder in Explorer and choose `Open in Custom Terminal` / `使用自定义终端打开`.
- Files open their parent folder; folders open directly.
- If the custom terminal command fails, VS Code automatically opens `settings.json` and shows a configuration example.

## Custom Terminal Settings

Set these in VS Code settings:

```json
{
  "openExternalTerminal.customTerminalPath": "wt.exe",
  "openExternalTerminal.customTerminalArgs": ["-d", "${cwd}"]
}
```

Examples:

```json
{
  "openExternalTerminal.customTerminalPath": "powershell.exe"
}
```

```json
{
  "openExternalTerminal.customTerminalPath": "wezterm",
  "openExternalTerminal.customTerminalArgs": ["start", "--cwd", "${cwd}"]
}
```

If `customTerminalArgs` is empty, the terminal process is started with its working directory set to the selected folder.

## Development

```bash
npm install
npm run compile
```

Open this folder in VS Code and press `F5` to launch an Extension Development Host.

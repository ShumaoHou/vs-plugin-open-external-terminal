# Open External Terminal / 打开外部终端

VS Code extension that adds Explorer context-menu commands to open the selected file or folder in an external terminal.

一个 VS Code 扩展，用于在资源管理器右键菜单中快速使用外部终端打开选中的文件或文件夹。

## Features / 功能

- Right-click a file or folder in Explorer and choose `Open in System Terminal` / `使用系统终端打开`.
- 在资源管理器中右键文件或文件夹，选择 `Open in System Terminal` / `使用系统终端打开`。

- Right-click a file or folder in Explorer and choose `Open in Custom Terminal` / `使用自定义终端打开`.
- 在资源管理器中右键文件或文件夹，选择 `Open in Custom Terminal` / `使用自定义终端打开`。

- Files open their parent folder; folders open directly.
- 选中文件时打开其所在目录，选中文件夹时直接打开该文件夹。

- If the custom terminal command fails, VS Code automatically opens `settings.json` and shows a configuration example.
- 使用自定义终端打开失败时，VS Code 会自动打开 `settings.json` 并显示配置示例。

## Custom Terminal Settings / 自定义终端配置

Set these in VS Code settings:

在 VS Code 设置中添加以下配置：

```json
{
  "openExternalTerminal.customTerminalPath": "wt.exe",
  "openExternalTerminal.customTerminalArgs": ["-d", "${cwd}"]
}
```

Examples:

示例：

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

如果 `customTerminalArgs` 为空，终端进程会以选中的文件夹作为工作目录启动。

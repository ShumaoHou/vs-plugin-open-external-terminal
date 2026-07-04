import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import * as vscode from 'vscode';

type TerminalCommand = {
  command: string;
  args: string[];
};

type LocaleKey =
  | 'copyConfigExample'
  | 'customTerminalPathRequired'
  | 'openTerminalFailed'
  | 'openTerminalFailedWithConfigExample'
  | 'selectLocalResource';

const messages: Record<'en' | 'zh', Record<LocaleKey, string>> = {
  en: {
    copyConfigExample: 'Copy Config Example',
    customTerminalPathRequired: 'Please configure openExternalTerminal.customTerminalPath first.',
    openTerminalFailed: 'Failed to open external terminal: {0}',
    openTerminalFailedWithConfigExample: 'Failed to open external terminal: {0} Config example: {1}',
    selectLocalResource: 'Select a local file or folder in Explorer.'
  },
  zh: {
    copyConfigExample: '复制配置示例',
    customTerminalPathRequired: '请先配置 openExternalTerminal.customTerminalPath。',
    openTerminalFailed: '打开外部终端失败: {0}',
    openTerminalFailedWithConfigExample: '打开外部终端失败: {0} 配置示例: {1}',
    selectLocalResource: '请选择资源管理器中的本地文件或文件夹。'
  }
};

const customTerminalConfigExample = `{
  "openExternalTerminal.customTerminalPath": "wt.exe",
  "openExternalTerminal.customTerminalArgs": ["-d", "\${cwd}"]
}`;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('openExternalTerminal.openInSystemTerminal', async (uri?: vscode.Uri) => {
      await openTerminal(uri, getSystemTerminalCommand);
    }),
    vscode.commands.registerCommand('openExternalTerminal.openInCustomTerminal', async (uri?: vscode.Uri) => {
      await openTerminal(uri, getCustomTerminalCommand, { openSettingsOnError: true });
    })
  );
}

export function deactivate(): void {}

async function openTerminal(
  uri: vscode.Uri | undefined,
  resolveCommand: (cwd: string) => TerminalCommand | Promise<TerminalCommand>,
  options: { openSettingsOnError?: boolean } = {}
): Promise<void> {
  try {
    const cwd = await resolveTargetDirectory(uri);
    const { command, args } = await resolveCommand(cwd);

    await spawnDetached(command, args, cwd);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (options.openSettingsOnError) {
      await vscode.commands.executeCommand('workbench.action.openSettingsJson');
      const copyConfigExampleAction = localize('copyConfigExample');
      const selectedAction = await vscode.window.showErrorMessage(
        localize('openTerminalFailedWithConfigExample', message, customTerminalConfigExample),
        copyConfigExampleAction
      );

      if (selectedAction === copyConfigExampleAction) {
        await vscode.env.clipboard.writeText(customTerminalConfigExample);
      }
      return;
    }

    void vscode.window.showErrorMessage(localize('openTerminalFailed', message));
  }
}

async function resolveTargetDirectory(uri: vscode.Uri | undefined): Promise<string> {
  const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;

  if (!targetUri || targetUri.scheme !== 'file') {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder?.uri.scheme === 'file') {
      return workspaceFolder.uri.fsPath;
    }

    throw new Error(localize('selectLocalResource'));
  }

  const selectedPath = targetUri.fsPath;
  const stat = await fs.stat(selectedPath);

  return stat.isDirectory() ? selectedPath : path.dirname(selectedPath);
}

function getSystemTerminalCommand(cwd: string): TerminalCommand {
  if (process.platform === 'win32') {
    return {
      command: process.env.ComSpec || 'cmd.exe',
      args: ['/c', 'start', '""', process.env.ComSpec || 'cmd.exe']
    };
  }

  if (process.platform === 'darwin') {
    return {
      command: 'open',
      args: ['-a', 'Terminal', cwd]
    };
  }

  return {
    command: 'x-terminal-emulator',
    args: []
  };
}

function getCustomTerminalCommand(cwd: string): TerminalCommand {
  const config = vscode.workspace.getConfiguration('openExternalTerminal');
  const command = config.get<string>('customTerminalPath', '').trim();
  const configuredArgs = config.get<string[]>('customTerminalArgs', []);

  if (!command) {
    throw new Error(localize('customTerminalPathRequired'));
  }

  const args = configuredArgs.map((arg) => arg.replaceAll('${cwd}', cwd));

  return { command, args };
}

function localize(key: LocaleKey, ...args: string[]): string {
  const language = vscode.env.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  let message = messages[language][key];

  args.forEach((value, index) => {
    message = message.replace(`{${index}}`, value);
  });

  return message;
}

function spawnDetached(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });

    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

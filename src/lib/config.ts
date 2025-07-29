import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import { Config, CurrentConfig } from '../types';
import { i18n } from '../i18n';

export class ConfigManager {
    private configFile: string;
    private currentFile: string;

    constructor() {
        this.configFile = path.join(os.homedir(), '.claude_config');
        this.currentFile = path.join(os.homedir(), '.claude_current');
    }

    public initConfig(): void {
        if (!fs.existsSync(this.configFile)) {
            const defaultConfig = `ww|问问Code|sk-xxxxxxWWWWWWxxxxxx|https://code.wenwen-ai.com
any|AnyRouter|sk-xxxxxxANYxxxxxx|https://anyrouter.top
kimi|月之暗面|sk-xxxxxxKIMIxxxxxx|https://api.moonshot.cn/anthropic`;
            
            fs.writeFileSync(this.configFile, defaultConfig, 'utf8');
            console.log(i18n.t('config.created', this.configFile));
            console.log(i18n.t('config.editHint'));
        }
    }

    public getAllConfigs(): Config[] {
        this.initConfig();
        const content = fs.readFileSync(this.configFile, 'utf8');
        return content.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [alias, name, token, url] = line.split('|');
                return { alias, name, token, url };
            });
    }

    public getConfig(alias: string): Config | undefined {
        const configs = this.getAllConfigs();
        return configs.find(config => config.alias === alias);
    }

    public addConfig(alias: string, name: string, token: string, url: string): void {
        const configs = this.getAllConfigs();
        
        if (configs.find(config => config.alias === alias)) {
            throw new Error(i18n.t('config.aliasExists', alias));
        }
        
        const newConfig = `${alias}|${name}|${token}|${url}`;
        fs.appendFileSync(this.configFile, '\n' + newConfig, 'utf8');
    }

    public removeConfig(alias: string): Config {
        const configs = this.getAllConfigs();
        const configToRemove = configs.find(config => config.alias === alias);
        
        if (!configToRemove) {
            throw new Error(i18n.t('config.notFound', alias));
        }
        
        const remainingConfigs = configs.filter(config => config.alias !== alias);
        const content = remainingConfigs.map(config => 
            `${config.alias}|${config.name}|${config.token}|${config.url}`
        ).join('\n');
        
        fs.writeFileSync(this.configFile, content, 'utf8');
        
        if (fs.existsSync(this.currentFile)) {
            const currentContent = fs.readFileSync(this.currentFile, 'utf8');
            if (currentContent.startsWith(alias + '|')) {
                fs.unlinkSync(this.currentFile);
                console.log(i18n.t('config.currentCleared'));
            }
        }
        
        return configToRemove;
    }

    private isWindows(): boolean {
        return os.platform() === 'win32';
    }

    private detectShell(): string {
        if (this.isWindows()) {
            // Windows 系统检测
            if (process.env.PSModulePath) {
                return 'powershell';
            } else if (process.env.COMSPEC && process.env.COMSPEC.includes('cmd')) {
                return 'cmd';
            } else {
                return 'powershell'; // 默认使用 PowerShell
            }
        }
        
        // Unix 系统检测
        const shell = process.env.SHELL || '';
        if (shell.includes('zsh')) {
            return 'zsh';
        } else if (shell.includes('bash')) {
            return 'bash';
        }
        
        // 备用检测方法
        if (process.env.ZSH_VERSION || process.env.ZSH_NAME) {
            return 'zsh';
        } else if (process.env.BASH_VERSION) {
            return 'bash';
        } else {
            return 'unknown';
        }
    }

    private getProfileFile(): string {
        const shellType = this.detectShell();
        const homeDir = os.homedir();
        
        if (this.isWindows()) {
            switch (shellType) {
                case 'powershell':
                    // PowerShell 配置文件路径
                    const documentsPath = path.join(homeDir, 'Documents');
                    const psPath = path.join(documentsPath, 'WindowsPowerShell');
                    if (!fs.existsSync(psPath)) {
                        fs.mkdirSync(psPath, { recursive: true });
                    }
                    return path.join(psPath, 'Microsoft.PowerShell_profile.ps1');
                case 'cmd':
                    // CMD 不支持配置文件，返回空字符串表示使用注册表方式
                    return '';
                default:
                    return path.join(homeDir, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
            }
        }
        
        // Unix 系统
        switch (shellType) {
            case 'zsh':
                return path.join(homeDir, '.zshrc');
            case 'bash':
                const bashProfile = path.join(homeDir, '.bash_profile');
                if (fs.existsSync(bashProfile)) {
                    return bashProfile;
                } else {
                    return path.join(homeDir, '.bashrc');
                }
            default:
                return path.join(homeDir, '.profile');
        }
    }

    private setWindowsEnvironmentVariable(key: string, value: string): void {
        try {
            // 使用 setx 命令设置用户级环境变量
            child_process.execSync(`setx ${key} "${value}"`, { stdio: 'pipe' });
        } catch (error) {
            console.error(`Failed to set Windows environment variable ${key}:`, error);
        }
    }

    private updateWindowsPowerShellConfig(config: Config, profileFile: string): void {
        let content = '';
        if (fs.existsSync(profileFile)) {
            content = fs.readFileSync(profileFile, 'utf8');
        }

        const envVarStart = '# Claude Code Environment Variables';
        const envVarEnd = '# End Claude Code Environment Variables';
        
        const startIndex = content.indexOf(envVarStart);
        const endIndex = content.indexOf(envVarEnd);
        
        const newEnvVars = `${envVarStart}
$env:ANTHROPIC_BASE_URL = "${config.url}"
$env:ANTHROPIC_AUTH_TOKEN = "${config.token}"
${envVarEnd}`;

        if (startIndex !== -1 && endIndex !== -1) {
            // 替换现有的环境变量配置
            const beforeConfig = content.substring(0, startIndex);
            const afterConfig = content.substring(endIndex + envVarEnd.length);
            content = beforeConfig + newEnvVars + afterConfig;
        } else {
            // 添加新的环境变量配置
            if (content && !content.endsWith('\n')) {
                content += '\n';
            }
            content += '\n' + newEnvVars + '\n';
        }

        fs.writeFileSync(profileFile, content, 'utf8');
    }

    private updateUnixShellConfig(config: Config, profileFile: string): void {
        let content = '';
        if (fs.existsSync(profileFile)) {
            content = fs.readFileSync(profileFile, 'utf8');
        }

        const envVarStart = '# Claude Code Environment Variables';
        const envVarEnd = '# End Claude Code Environment Variables';
        
        const startIndex = content.indexOf(envVarStart);
        const endIndex = content.indexOf(envVarEnd);
        
        const newEnvVars = `${envVarStart}
export ANTHROPIC_BASE_URL="${config.url}"
export ANTHROPIC_AUTH_TOKEN="${config.token}"
${envVarEnd}`;

        if (startIndex !== -1 && endIndex !== -1) {
            // 替换现有的环境变量配置
            const beforeConfig = content.substring(0, startIndex);
            const afterConfig = content.substring(endIndex + envVarEnd.length);
            content = beforeConfig + newEnvVars + afterConfig;
        } else {
            // 添加新的环境变量配置
            if (content && !content.endsWith('\n')) {
                content += '\n';
            }
            content += '\n' + newEnvVars + '\n';
        }

        fs.writeFileSync(profileFile, content, 'utf8');
    }

    private setCurrentSessionEnvironmentVariables(config: Config): void {
        // 为当前 Node.js 进程设置环境变量（立即生效，acm 命令本身和子进程都能使用）
        process.env.ANTHROPIC_AUTH_TOKEN = config.token;
        process.env.ANTHROPIC_BASE_URL = config.url;
        
        // 注意：Node.js 进程无法直接影响父 shell 的环境变量
        // 但我们保留这个设置，因为：
        // 1. 如果用户在脚本中调用 acm，这些变量会传递给子进程
        // 2. 当前 Node.js 进程可以访问这些变量
    }

    private generateSourceCommand(profileFile: string): string | null {
        if (this.isWindows()) {
            return null; // Windows 不支持 source 命令
        }

        const shell = process.env.SHELL || '';
        if (shell.includes('bash') || shell.includes('zsh')) {
            return `source "${profileFile}"`;
        }
        return null;
    }

    private createConvenientWrapper(config: Config): void {
        // 创建一个便捷的激活脚本，用户可以通过 eval 命令执行
        const tempFile = path.join(os.tmpdir(), `acm_activate_${Date.now()}.sh`);
        
        try {
            let content = '';
            if (this.isWindows()) {
                // Windows batch 脚本
                content = `@echo off
set ANTHROPIC_BASE_URL=${config.url}
set ANTHROPIC_AUTH_TOKEN=${config.token}
echo Environment variables set for current session
`;
                fs.writeFileSync(tempFile.replace('.sh', '.bat'), content, 'utf8');
                console.log(`💡 运行以下命令在当前会话中立即生效：`);
                console.log(`call "${tempFile.replace('.sh', '.bat')}"`);
            } else {
                // Unix shell 脚本
                content = `export ANTHROPIC_BASE_URL="${config.url}"
export ANTHROPIC_AUTH_TOKEN="${config.token}"
echo "✅ 环境变量已在当前会话中设置"
`;
                fs.writeFileSync(tempFile, content, 'utf8');
                console.log(`💡 运行以下命令在当前会话中立即生效：`);
                console.log(`source "${tempFile}"`);
                console.log(`或者直接运行：`);
                console.log(`eval "$(cat "${tempFile}")"`);
            }
            
            // 5秒后自动清理临时文件
            setTimeout(() => {
                try {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    const batFile = tempFile.replace('.sh', '.bat');
                    if (fs.existsSync(batFile)) fs.unlinkSync(batFile);
                } catch (e) {
                    // 忽略清理错误
                }
            }, 5000);
            
        } catch (error) {
            // 如果创建临时文件失败，回退到显示命令
            console.log(`💡 在当前终端运行以下命令立即生效：`);
            if (this.isWindows()) {
                console.log(`set ANTHROPIC_BASE_URL=${config.url}`);
                console.log(`set ANTHROPIC_AUTH_TOKEN=${config.token}`);
            } else {
                console.log(`export ANTHROPIC_BASE_URL="${config.url}"`);
                console.log(`export ANTHROPIC_AUTH_TOKEN="${config.token}"`);
            }
        }
    }

    private updateShellConfig(config: Config): void {
        const profileFile = this.getProfileFile();
        const shellType = this.detectShell();

        // 首先设置当前会话的环境变量（立即生效）
        this.setCurrentSessionEnvironmentVariables(config);

        if (this.isWindows()) {
            if (shellType === 'cmd' || !profileFile) {
                // CMD 或无配置文件时，使用注册表设置系统环境变量
                this.setWindowsEnvironmentVariable('ANTHROPIC_BASE_URL', config.url);
                this.setWindowsEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', config.token);
                console.log(i18n.t('config.windowsEnvVarSet'));
            } else {
                // PowerShell 配置文件
                this.updateWindowsPowerShellConfig(config, profileFile);
                console.log(i18n.t('config.shellConfigUpdated', profileFile));
            }
        } else {
            // Unix 系统
            this.updateUnixShellConfig(config, profileFile);
            console.log(i18n.t('config.shellConfigUpdated', profileFile));
            
            // 为其他终端提供 source 提示
            const sourceCmd = this.generateSourceCommand(profileFile);
            if (sourceCmd) {
                console.log(i18n.t('config.unixSourceHint', profileFile));
            }
        }
        
        // 创建便捷的激活方式
        this.createConvenientWrapper(config);
    }

    public setCurrentConfig(config: Config): void {
        const configLine = `${config.alias}|${config.name}|${config.token}|${config.url}`;
        fs.writeFileSync(this.currentFile, configLine, 'utf8');
        
        // 更新 shell 配置文件和设置环境变量
        this.updateShellConfig(config);
    }

    public getCurrentConfig(): CurrentConfig | null {
        if (!fs.existsSync(this.currentFile)) {
            return null;
        }
        
        const content = fs.readFileSync(this.currentFile, 'utf8');
        const [alias, name, token, url] = content.split('|');
        
        const isActive = process.env.ANTHROPIC_AUTH_TOKEN === token && 
                        process.env.ANTHROPIC_BASE_URL === url;
        
        return { alias, name, token, url, isActive };
    }
}
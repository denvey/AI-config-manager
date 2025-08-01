import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type SupportedLanguage = 'zh' | 'en';

export interface Messages {
    [key: string]: string | Messages;
}

export class I18n {
    private currentLanguage: SupportedLanguage = 'zh';
    private messages: Record<SupportedLanguage, Messages> = {
        zh: {},
        en: {}
    };
    private configFile: string;

    constructor() {
        this.configFile = path.join(os.homedir(), '.acm_lang');
        this.loadMessages();
        // this.loadLanguageConfig();
    }

    private loadMessages(): void {
        // 直接使用内置消息，避免 require 问题
        this.loadBuiltinMessages();
    }

    private loadBuiltinMessages(): void {
        this.messages = {
            zh: {
                common: {
                    error: '错误',
                    success: '成功',
                    warning: '警告',
                    info: '信息'
                },
                config: {
                    created: '已创建默认配置文件: {0}',
                    editHint: '请编辑此文件，填入您的真实 API 密钥',
                    aliasExists: '配置别名 \'{0}\' 已存在',
                    notFound: '配置 \'{0}\' 不存在',
                    currentCleared: '当前配置已清除',
                    shellConfigUpdated: '已更新 shell 配置文件: {0}',
                    windowsEnvVarSet: '已设置 Windows 系统环境变量（重启终端后生效）',
                    currentSessionActive: '✓ 当前会话已生效，可直接使用',
                    unixSourceHint: '💡 提示：新开窗口立即生效。由于限制在当前窗口生效需运行 `source {0}` 后才能立即生效',
                    immediateEffectCommands: '🚀 在当前终端立即生效，请运行以下命令：'
                },
                commands: {
                    list: {
                        title: '可用配置:',
                        headers: {
                            alias: '别名',
                            name: '类型',
                            token: 'API密钥(前15位)',
                            url: 'API地址'
                        }
                    },
                    use: {
                        missingAlias: '请指定配置别名',
                        listHint: '使用 \'acm list\' 查看可用配置',
                        notFound: '未找到配置 \'{0}\'',
                        switched: '已切换到: {0}',
                        apiUrl: 'API地址: {0}',
                        token: '密钥: {0}...',
                        envSet: '环境变量已设置，请在当前终端会话中使用。',
                        shellHint: '要在新终端中自动应用此配置，请将以下命令添加到您的 shell 配置文件:'
                    },
                    add: {
                        missingParams: '参数不完整',
                        usage: '用法: acm add <alias> <name> <token> <url>',
                        added: '已添加配置: {0} ({1})'
                    },
                    remove: {
                        missingAlias: '请指定要删除的配置别名',
                        removed: '已删除配置: {0} ({1})'
                    },
                    current: {
                        none: '当前没有设置任何配置',
                        hint: '使用 \'acm use <alias>\' 设置配置',
                        title: '当前配置:',
                        alias: '别名: {0}',
                        name: '类型: {0}',
                        url: 'API地址: {0}',
                        token: '密钥: {0}...',
                        active: '状态: 已激活 ✓',
                        inactive: '状态: 未激活 (请运行 \'acm use {0}\' 激活)'
                    },
                    help: {
                        title: 'ACM (AI Configuration Manager) - 类似 nvm/nrm 的 AI API 配置切换工具',
                        usage: '用法:',
                        usageText: 'acm <command> [arguments]',
                        commands: '命令:',
                        commandList: {
                            use: 'use <alias>              切换到指定的配置',
                            list: 'list                     显示所有可用配置',
                            add: 'add <alias> <token> <url> [key_type] 添加新配置',
                            remove: 'remove <alias>           删除指定配置',
                            current: 'current                  显示当前使用的配置',
                            lang: 'lang <zh|en>             切换语言',
                            help: 'help                     显示此帮助信息'
                        },
                        examples: '示例:',
                        exampleList: {
                            use: 'acm use kimi            # 切换到 kimi 配置',
                            list: 'acm list                # 查看所有配置',
                            add: 'acm add openai OpenAI sk-xxx https://api.openai.com',
                            remove: 'acm remove openai       # 删除 openai 配置',
                            current: 'acm current             # 查看当前配置',
                            lang: 'acm lang en             # 切换到英文'
                        },
                        configFiles: '配置文件位置:',
                        configFileList: {
                            config: '~/.claude_config        # 配置存储文件',
                            current: '~/.claude_current       # 当前配置记录文件',
                            lang: '~/.acm_lang             # 语言设置文件'
                        }
                    },
                    lang: {
                        current: '当前语言: {0}',
                        switched: '已切换到 {0} 语言',
                        usage: '用法: acm lang <zh|en>',
                        languageNames: {
                            zh: '中文',
                            en: 'English'
                        }
                    }
                }
            },
            en: {
                common: {
                    error: 'Error',
                    success: 'Success',
                    warning: 'Warning',
                    info: 'Info'
                },
                config: {
                    created: 'Created default config file: {0}',
                    editHint: 'Please edit this file and fill in your real API keys',
                    aliasExists: 'Config alias \'{0}\' already exists',
                    notFound: 'Config \'{0}\' not found',
                    currentCleared: 'Current config cleared',
                    shellConfigUpdated: 'Updated shell config file: {0}',
                    windowsEnvVarSet: 'Windows system environment variables set (restart terminal to take effect)',
                    currentSessionActive: '✓ Current session is active, ready to use',
                    unixSourceHint: '💡 Tip: Changes will take effect immediately in a new terminal window. Due to limitations, to apply changes in the current window you need to run `source {0}`.',
                    immediateEffectCommands: '🚀 For immediate effect in current terminal, run these commands:'
                },
                commands: {
                    list: {
                        title: 'Available configs:',
                        headers: {
                            alias: 'Alias',
                            name: 'Name',
                            token: 'API Key (first 15 chars)',
                            url: 'API URL'
                        }
                    },
                    use: {
                        missingAlias: 'Please specify config alias',
                        listHint: 'Use \'acm list\' to see available configs',
                        notFound: 'Config \'{0}\' not found',
                        switched: 'Switched to: {0}',
                        apiUrl: 'API URL: {0}',
                        token: 'Token: {0}...',
                        envSet: 'Environment variables set, use in current terminal session.',
                        shellHint: 'To auto-apply this config in new terminals, add these commands to your shell config file:'
                    },
                    add: {
                        missingParams: 'Missing parameters',
                        usage: 'Usage: acm add <alias> <token> <url> [key_type]',
                        added: 'Added config: {0} ({1})'
                    },
                    remove: {
                        missingAlias: 'Please specify config alias to remove',
                        removed: 'Removed config: {0} ({1})'
                    },
                    current: {
                        none: 'No config is currently set',
                        hint: 'Use \'acm use <alias>\' to set config',
                        title: 'Current config:',
                        alias: 'Alias: {0}',
                        name: 'Name: {0}',
                        url: 'API URL: {0}',
                        token: 'Token: {0}...',
                        active: 'Status: Active ✓',
                        inactive: 'Status: Inactive (run \'acm use {0}\' to activate)'
                    },
                    help: {
                        title: 'ACM (AI Configuration Manager) - nvm/nrm-like AI API config switcher',
                        usage: 'Usage:',
                        usageText: 'acm <command> [arguments]',
                        commands: 'Commands:',
                        commandList: {
                            use: 'use <alias>              Switch to specified config',
                            list: 'list                     Show all available configs',
                            add: 'add <alias> <token> <url> [key_type] Add new config',
                            remove: 'remove <alias>           Remove specified config',
                            current: 'current                  Show current config',
                            lang: 'lang <zh|en>             Switch language',
                            help: 'help                     Show this help message'
                        },
                        examples: 'Examples:',
                        exampleList: {
                            use: 'acm use kimi            # Switch to kimi config',
                            list: 'acm list                # List all configs',
                            add: 'acm add openai OpenAI sk-xxx https://api.openai.com',
                            remove: 'acm remove openai       # Remove openai config',
                            current: 'acm current             # Show current config',
                            lang: 'acm lang en             # Switch to English'
                        },
                        configFiles: 'Config files:',
                        configFileList: {
                            config: '~/.claude_config        # Config storage file',
                            current: '~/.claude_current       # Current config record file',
                            lang: '~/.acm_lang             # Language setting file'
                        }
                    },
                    lang: {
                        current: 'Current language: {0}',
                        switched: 'Switched to {0} language',
                        usage: 'Usage: acm lang <zh|en>',
                        languageNames: {
                            zh: '中文',
                            en: 'English'
                        }
                    }
                }
            }
        };
    }

    private loadLanguageConfig(): void {
        if (fs.existsSync(this.configFile)) {
            try {
                const lang = fs.readFileSync(this.configFile, 'utf8').trim() as SupportedLanguage;
                if (lang === 'zh' || lang === 'en') {
                    this.currentLanguage = lang;
                }
            } catch (error) {
                // 使用默认语言
            }
        } else {
            // 自动检测语言
            this.autoDetectLanguage();
        }
    }

    private autoDetectLanguage(): void {
        const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
        if (locale.includes('zh') || locale.includes('CN')) {
            this.currentLanguage = 'zh';
        } else {
            this.currentLanguage = 'en';
        }
    }

    public setLanguage(lang: SupportedLanguage): void {
        this.currentLanguage = lang;
        fs.writeFileSync(this.configFile, lang, 'utf8');
    }

    public getCurrentLanguage(): SupportedLanguage {
        return this.currentLanguage;
    }

    public t(key: string, ...args: string[]): string {
        const keys = key.split('.');
        let message: any = this.messages[this.currentLanguage];
        
        for (const k of keys) {
            if (message && typeof message === 'object') {
                message = message[k];
            } else {
                // 回退到英文
                message = this.messages.en;
                for (const fallbackKey of keys) {
                    if (message && typeof message === 'object') {
                        message = message[fallbackKey];
                    } else {
                        return key; // 如果都找不到，返回 key
                    }
                }
                break;
            }
        }

        if (typeof message !== 'string') {
            return key;
        }

        // 替换占位符
        return message.replace(/\{(\d+)\}/g, (match, index) => {
            const argIndex = parseInt(index);
            return args[argIndex] || match;
        });
    }
}

// 单例实例
export const i18n = new I18n();
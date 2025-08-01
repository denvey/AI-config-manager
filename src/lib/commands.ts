import chalk from 'chalk';
import { ConfigManager } from './config';
import { i18n, SupportedLanguage } from '../i18n';

export class Commands {
    private configManager: ConfigManager;

    constructor() {
        this.configManager = new ConfigManager();
    }

    public list(): void {
        try {
            const configs = this.configManager.getAllConfigs();
            
            console.log(chalk.cyan(i18n.t('commands.list.title')));
            const headers = i18n.t('commands.list.headers.alias').padEnd(20) + 
                           i18n.t('commands.list.headers.name').padEnd(15) + 
                           i18n.t('commands.list.headers.token').padEnd(20) + 
                           i18n.t('commands.list.headers.url');
            console.log(chalk.gray(headers));
            console.log(chalk.gray('------------------------------------------------------------'));
            
            configs.forEach(config => {
                const tokenPreview = config.token.substring(0, 15) + '...';
                console.log(
                    config.alias.padEnd(20) + 
                    config.name.padEnd(15) + 
                    tokenPreview.padEnd(20) + 
                    config.url
                );
            });
        } catch (error) {
            console.error(chalk.red(i18n.t('common.error') + ':'), (error as Error).message);
            process.exit(1);
        }
    }

    public use(alias: string): void {
        if (!alias) {
            console.error(chalk.red(i18n.t('common.error') + ': ' + i18n.t('commands.use.missingAlias')));
            console.log(i18n.t('commands.use.listHint'));
            process.exit(1);
        }

        try {
            const config = this.configManager.getConfig(alias);
            
            if (!config) {
                console.error(chalk.red(i18n.t('common.error') + ': ' + i18n.t('commands.use.notFound', alias)));
                console.log(i18n.t('commands.use.listHint'));
                process.exit(1);
            }

            this.configManager.setCurrentConfig(config);
            
            console.log(chalk.green(i18n.t('commands.use.switched', config.alias)));
            console.log(chalk.gray(i18n.t('commands.use.apiUrl', config.url)));
            console.log(chalk.gray(i18n.t('commands.use.token', config.token.substring(0, 15))));
        } catch (error) {
            console.error(chalk.red(i18n.t('common.error') + ':'), (error as Error).message);
            process.exit(1);
        }
    }

    public add(alias: string, token: string, url: string, type?: string): void {
        if (!alias || !token || !url) {
            console.error(chalk.red(i18n.t('common.error') + ': ' + i18n.t('commands.add.missingParams')));
            console.log(i18n.t('commands.add.usage'));
            process.exit(1);
        }
        
        let name = 'Claude';
        
        // Determine key type based on manual specification or URL rules
        let keyType = this.determineKeyType(url, type);
        
        try {
            this.configManager.addConfig(alias, name, token, url, keyType);
            console.log(chalk.green(i18n.t('commands.add.added', name, alias)));
        } catch (error) {
            console.error(chalk.red(i18n.t('common.error') + ':'), (error as Error).message);
            process.exit(1);
        }
    }

    private determineKeyType(url: string, manualType?: string): 'KEY' | 'TOKEN' {
        // If manually specified, validate and use it
        if (manualType) {
            const normalizedType = manualType.toLowerCase();
            if (['key', 'k'].includes(normalizedType)) {
                return 'KEY';
            } else if (['token', 't'].includes(normalizedType)) {
                return 'TOKEN';
            }
        }
        
        // Built-in URL rules based on feature.md
        const tokenUrls = [
            'https://code.wenwen-ai.com',
            'https://api.aicodewith.com'
        ];
        
        const keyUrls = [
            'https://api.aicodemirror.com/api/claudecode',
            'https://gaccode.com/claudecode'
        ];
        
        if (tokenUrls.includes(url)) {
            return 'TOKEN';
        } else if (keyUrls.includes(url)) {
            return 'KEY';
        }
        
        // Default to TOKEN for unknown URLs
        return 'TOKEN';
    }

    public remove(alias: string): void {
        if (!alias) {
            console.error(chalk.red(i18n.t('common.error') + ': ' + i18n.t('commands.remove.missingAlias')));
            process.exit(1);
        }

        try {
            const removedConfig = this.configManager.removeConfig(alias);
            console.log(chalk.green(i18n.t('commands.remove.removed', removedConfig.name, alias)));
        } catch (error) {
            console.error(chalk.red(i18n.t('common.error') + ':'), (error as Error).message);
            process.exit(1);
        }
    }

    public current(): void {
        try {
            const currentConfig = this.configManager.getCurrentConfig();
            
            if (!currentConfig) {
                console.log(chalk.yellow(i18n.t('commands.current.none')));
                console.log(i18n.t('commands.current.hint'));
                return;
            }

            console.log(chalk.cyan(i18n.t('commands.current.title')));
            console.log(chalk.gray(i18n.t('commands.current.alias', currentConfig.alias)));
            console.log(chalk.gray(i18n.t('commands.current.name', currentConfig.name)));
            console.log(chalk.gray(i18n.t('commands.current.url', currentConfig.url)));
            console.log(chalk.gray(i18n.t('commands.current.token', currentConfig.token.substring(0, 15))));
            
            if (currentConfig.isActive) {
                console.log(chalk.green(i18n.t('commands.current.active')));
            } else {
                console.log(chalk.yellow(i18n.t('commands.current.inactive', currentConfig.alias)));
            }
        } catch (error) {
            console.error(chalk.red(i18n.t('common.error') + ':'), (error as Error).message);
            process.exit(1);
        }
    }

    public help(): void {
        console.log(chalk.cyan.bold(i18n.t('commands.help.title')));
        console.log();
        console.log(chalk.yellow(i18n.t('commands.help.usage')));
        console.log('    ' + i18n.t('commands.help.usageText'));
        console.log();
        console.log(chalk.yellow(i18n.t('commands.help.commands')));
        console.log('    ' + i18n.t('commands.help.commandList.use'));
        console.log('    ' + i18n.t('commands.help.commandList.list'));
        console.log('    ' + i18n.t('commands.help.commandList.add'));
        console.log('    ' + i18n.t('commands.help.commandList.remove'));
        console.log('    ' + i18n.t('commands.help.commandList.current'));
        console.log('    ' + i18n.t('commands.help.commandList.lang'));
        console.log('    ' + i18n.t('commands.help.commandList.help'));
        console.log();
        console.log(chalk.yellow(i18n.t('commands.help.examples')));
        console.log('    ' + i18n.t('commands.help.exampleList.use'));
        console.log('    ' + i18n.t('commands.help.exampleList.list'));
        console.log('    ' + i18n.t('commands.help.exampleList.add'));
        console.log('    ' + i18n.t('commands.help.exampleList.remove'));
        console.log('    ' + i18n.t('commands.help.exampleList.current'));
        console.log('    ' + i18n.t('commands.help.exampleList.lang'));
        console.log();
        console.log(chalk.yellow(i18n.t('commands.help.configFiles')));
        console.log('    ' + i18n.t('commands.help.configFileList.config'));
        console.log('    ' + i18n.t('commands.help.configFileList.current'));
        console.log('    ' + i18n.t('commands.help.configFileList.lang'));
    }

    public lang(language?: string): void {
        if (!language) {
            const currentLang = i18n.getCurrentLanguage();
            const langName = i18n.t('commands.lang.languageNames.' + currentLang);
            console.log(i18n.t('commands.lang.current', langName));
            return;
        }

        if (language !== 'zh' && language !== 'en') {
            console.error(chalk.red(i18n.t('common.error') + ': ' + i18n.t('commands.lang.usage')));
            process.exit(1);
        }

        i18n.setLanguage(language as SupportedLanguage);
        const langName = i18n.t('commands.lang.languageNames.' + language);
        console.log(chalk.green(i18n.t('commands.lang.switched', langName)));
    }
}
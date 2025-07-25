import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
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

    public setCurrentConfig(config: Config): void {
        const configLine = `${config.alias}|${config.name}|${config.token}|${config.url}`;
        fs.writeFileSync(this.currentFile, configLine, 'utf8');
        
        process.env.ANTHROPIC_AUTH_TOKEN = config.token;
        process.env.ANTHROPIC_BASE_URL = config.url;
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
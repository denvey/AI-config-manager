const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
    constructor() {
        this.configFile = path.join(os.homedir(), '.claude_config');
        this.currentFile = path.join(os.homedir(), '.claude_current');
    }

    initConfig() {
        if (!fs.existsSync(this.configFile)) {
            const defaultConfig = `ww|问问Code|sk-xxxxxxWWWWWWxxxxxx|https://code.wenwen-ai.com
any|AnyRouter|sk-xxxxxxANYxxxxxx|https://anyrouter.top
kimi|月之暗面|sk-xxxxxxKIMIxxxxxx|https://api.moonshot.cn/anthropic`;
            
            fs.writeFileSync(this.configFile, defaultConfig, 'utf8');
            console.log(`已创建默认配置文件: ${this.configFile}`);
            console.log('请编辑此文件，填入您的真实 API 密钥');
        }
    }

    getAllConfigs() {
        this.initConfig();
        const content = fs.readFileSync(this.configFile, 'utf8');
        return content.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [alias, name, token, url] = line.split('|');
                return { alias, name, token, url };
            });
    }

    getConfig(alias) {
        const configs = this.getAllConfigs();
        return configs.find(config => config.alias === alias);
    }

    addConfig(alias, name, token, url) {
        const configs = this.getAllConfigs();
        
        if (configs.find(config => config.alias === alias)) {
            throw new Error(`配置别名 '${alias}' 已存在`);
        }
        
        const newConfig = `${alias}|${name}|${token}|${url}`;
        fs.appendFileSync(this.configFile, '\n' + newConfig, 'utf8');
    }

    removeConfig(alias) {
        const configs = this.getAllConfigs();
        const configToRemove = configs.find(config => config.alias === alias);
        
        if (!configToRemove) {
            throw new Error(`配置 '${alias}' 不存在`);
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
                console.log('当前配置已清除');
            }
        }
        
        return configToRemove;
    }

    setCurrentConfig(config) {
        const configLine = `${config.alias}|${config.name}|${config.token}|${config.url}`;
        fs.writeFileSync(this.currentFile, configLine, 'utf8');
        
        process.env.ANTHROPIC_AUTH_TOKEN = config.token;
        process.env.ANTHROPIC_BASE_URL = config.url;
    }

    getCurrentConfig() {
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

module.exports = ConfigManager;
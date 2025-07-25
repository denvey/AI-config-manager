const chalk = require('chalk');
const ConfigManager = require('./config');

class Commands {
    constructor() {
        this.configManager = new ConfigManager();
    }

    list() {
        try {
            const configs = this.configManager.getAllConfigs();
            
            console.log(chalk.cyan('可用配置:'));
            console.log(chalk.gray('别名'.padEnd(10) + '名称'.padEnd(15) + 'API密钥(前15位)'.padEnd(20) + 'API地址'));
            console.log(chalk.gray('------------------------------------------------------------'));
            
            configs.forEach(config => {
                const tokenPreview = config.token.substring(0, 15) + '...';
                console.log(
                    config.alias.padEnd(10) + 
                    config.name.padEnd(15) + 
                    tokenPreview.padEnd(20) + 
                    config.url
                );
            });
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
            process.exit(1);
        }
    }

    use(alias) {
        if (!alias) {
            console.error(chalk.red('错误: 请指定配置别名'));
            console.log('使用 \'acm list\' 查看可用配置');
            process.exit(1);
        }

        try {
            const config = this.configManager.getConfig(alias);
            
            if (!config) {
                console.error(chalk.red(`错误: 未找到配置 '${alias}'`));
                console.log('使用 \'acm list\' 查看可用配置');
                process.exit(1);
            }

            this.configManager.setCurrentConfig(config);
            
            console.log(chalk.green('已切换到:'), config.name);
            console.log(chalk.gray('API地址:'), config.url);
            console.log(chalk.gray('密钥:'), config.token.substring(0, 15) + '...');
            console.log();
            console.log(chalk.yellow('环境变量已设置，请在当前终端会话中使用。'));
            console.log(chalk.yellow('要在新终端中自动应用此配置，请将以下命令添加到您的 shell 配置文件:'));
            console.log(chalk.gray(`export ANTHROPIC_AUTH_TOKEN="${config.token}"`));
            console.log(chalk.gray(`export ANTHROPIC_BASE_URL="${config.url}"`));
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
            process.exit(1);
        }
    }

    add(alias, name, token, url) {
        if (!alias || !name || !token || !url) {
            console.error(chalk.red('错误: 参数不完整'));
            console.log('用法: acm add <alias> <name> <token> <url>');
            process.exit(1);
        }

        try {
            this.configManager.addConfig(alias, name, token, url);
            console.log(chalk.green('已添加配置:'), `${name} (${alias})`);
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
            process.exit(1);
        }
    }

    remove(alias) {
        if (!alias) {
            console.error(chalk.red('错误: 请指定要删除的配置别名'));
            process.exit(1);
        }

        try {
            const removedConfig = this.configManager.removeConfig(alias);
            console.log(chalk.green('已删除配置:'), `${removedConfig.name} (${alias})`);
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
            process.exit(1);
        }
    }

    current() {
        try {
            const currentConfig = this.configManager.getCurrentConfig();
            
            if (!currentConfig) {
                console.log(chalk.yellow('当前没有设置任何配置'));
                console.log('使用 \'acm use <alias>\' 设置配置');
                return;
            }

            console.log(chalk.cyan('当前配置:'));
            console.log(chalk.gray('别名:'), currentConfig.alias);
            console.log(chalk.gray('名称:'), currentConfig.name);
            console.log(chalk.gray('API地址:'), currentConfig.url);
            console.log(chalk.gray('密钥:'), currentConfig.token.substring(0, 15) + '...');
            
            if (currentConfig.isActive) {
                console.log(chalk.green('状态: 已激活 ✓'));
            } else {
                console.log(chalk.yellow(`状态: 未激活 (请运行 'acm use ${currentConfig.alias}' 激活)`));
            }
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
            process.exit(1);
        }
    }

    help() {
        console.log(chalk.cyan.bold('ACM (AI Configuration Manager)'), '- 类似 nvm/nrm 的 AI API 配置切换工具');
        console.log();
        console.log(chalk.yellow('用法:'));
        console.log('    acm <command> [arguments]');
        console.log();
        console.log(chalk.yellow('命令:'));
        console.log('    use <alias>              切换到指定的配置');
        console.log('    list                     显示所有可用配置');
        console.log('    add <alias> <name> <token> <url>  添加新配置');
        console.log('    remove <alias>           删除指定配置');
        console.log('    current                  显示当前使用的配置');
        console.log('    help                     显示此帮助信息');
        console.log();
        console.log(chalk.yellow('示例:'));
        console.log('    acm use kimi            # 切换到 kimi 配置');
        console.log('    acm list                # 查看所有配置');
        console.log('    acm add openai OpenAI sk-xxx https://api.openai.com');
        console.log('    acm remove openai       # 删除 openai 配置');
        console.log('    acm current             # 查看当前配置');
        console.log();
        console.log(chalk.yellow('配置文件位置:'));
        console.log('    ~/.claude_config        # 配置存储文件');
        console.log('    ~/.claude_current       # 当前配置记录文件');
    }
}

module.exports = Commands;
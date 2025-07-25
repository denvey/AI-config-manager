#!/usr/bin/env node

import { program } from 'commander';
import { Commands } from '../lib/commands';

const commands = new Commands();

program
    .name('acm')
    .description('ACM (AI Configuration Manager) - 类似 nvm/nrm 的 AI API 配置切换工具')
    .version('1.0.0');

program
    .command('use <alias>')
    .description('切换到指定的配置')
    .action((alias: string) => {
        commands.use(alias);
    });

program
    .command('list')
    .alias('ls')
    .description('显示所有可用配置')
    .action(() => {
        commands.list();
    });

program
    .command('add <alias> <name> <token> <url>')
    .description('添加新配置')
    .action((alias: string, name: string, token: string, url: string) => {
        commands.add(alias, name, token, url);
    });

program
    .command('remove <alias>')
    .alias('rm')
    .description('删除指定配置')
    .action((alias: string) => {
        commands.remove(alias);
    });

program
    .command('current')
    .description('显示当前使用的配置')
    .action(() => {
        commands.current();
    });

program
    .command('lang [language]')
    .description('切换语言或显示当前语言')
    .action((language?: string) => {
        commands.lang(language);
    });

program
    .command('help', { isDefault: false })
    .description('显示帮助信息')
    .action(() => {
        commands.help();
    });

if (process.argv.length <= 2) {
    commands.help();
    process.exit(0);
}

program.parse(process.argv);
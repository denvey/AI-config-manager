#!/usr/bin/env node

const { program } = require('commander');
const Commands = require('../lib/commands');

const commands = new Commands();

program
    .name('acm')
    .description('ACM (AI Configuration Manager) - 类似 nvm/nrm 的 AI API 配置切换工具')
    .version('1.0.0');

program
    .command('use <alias>')
    .description('切换到指定的配置')
    .action((alias) => {
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
    .action((alias, name, token, url) => {
        commands.add(alias, name, token, url);
    });

program
    .command('remove <alias>')
    .alias('rm')
    .description('删除指定配置')
    .action((alias) => {
        commands.remove(alias);
    });

program
    .command('current')
    .description('显示当前使用的配置')
    .action(() => {
        commands.current();
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
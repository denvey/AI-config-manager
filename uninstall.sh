#!/bin/bash

set -e

ACM_DIR="$HOME/.acm"
CONFIG_FILE="$HOME/.claude_config"
CURRENT_FILE="$HOME/.claude_current"

echo "🗑️  开始卸载 ACM (AI Configuration Manager)..."

read -p "确定要删除 ACM 吗? 这将删除所有配置文件 (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消卸载"
    exit 0
fi

if [[ -d "$ACM_DIR" ]]; then
    rm -rf "$ACM_DIR"
    echo "✓ 删除目录: $ACM_DIR"
fi

if [[ -f "$CONFIG_FILE" ]]; then
    read -p "删除配置文件 ~/.claude_config? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$CONFIG_FILE"
        echo "✓ 删除配置文件: $CONFIG_FILE"
    else
        echo "保留配置文件: $CONFIG_FILE" 
    fi
fi

if [[ -f "$CURRENT_FILE" ]]; then
    rm -f "$CURRENT_FILE"
    echo "✓ 删除当前配置: $CURRENT_FILE"
fi

detect_shell() {
    if [[ -n "$ZSH_VERSION" ]]; then
        echo "zsh"
    elif [[ -n "$BASH_VERSION" ]]; then
        echo "bash"
    else
        echo "unknown"
    fi
}

SHELL_TYPE=$(detect_shell)
case "$SHELL_TYPE" in
    "zsh")
        PROFILE_FILE="$HOME/.zshrc"
        ;;
    "bash")
        if [[ -f "$HOME/.bash_profile" ]]; then
            PROFILE_FILE="$HOME/.bash_profile"
        else
            PROFILE_FILE="$HOME/.bashrc"
        fi
        ;;
    *)
        PROFILE_FILE="$HOME/.profile"
        ;;
esac

if [[ -f "$PROFILE_FILE" ]]; then
    if grep -q "ACM (AI Configuration Manager)" "$PROFILE_FILE"; then
        sed -i.backup '/# ACM (AI Configuration Manager)/,+1d' "$PROFILE_FILE"
        echo "✓ 从 $PROFILE_FILE 中移除 PATH 配置"
        echo "  备份文件: ${PROFILE_FILE}.backup"
    fi
fi

echo ""
echo "🎉 ACM 卸载完成!"
echo ""
echo "📋 清理完成:"
echo "- 删除了 ACM 程序目录"
echo "- 清理了 shell 配置"
echo "- 删除了运行时文件"
echo ""
echo "请重新加载 shell 配置或重新打开终端使更改生效。"
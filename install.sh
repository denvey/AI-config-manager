#!/bin/bash

set -e

ACM_DIR="$HOME/.acm"
ACM_SCRIPT="$ACM_DIR/acm"

echo "🚀 开始安装 ACM (AI Configuration Manager)..."

if [[ ! -d "$ACM_DIR" ]]; then
    mkdir -p "$ACM_DIR"
    echo "✓ 创建目录: $ACM_DIR"
fi

cp ./acm "$ACM_SCRIPT"
chmod +x "$ACM_SCRIPT"
echo "✓ 复制脚本到: $ACM_SCRIPT"

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

ACM_PATH_EXPORT='export PATH="$HOME/.acm:$PATH"'

if [[ -f "$PROFILE_FILE" ]] && grep -q "$ACM_PATH_EXPORT" "$PROFILE_FILE"; then
    echo "✓ PATH 已存在于 $PROFILE_FILE"
else
    echo "" >> "$PROFILE_FILE"
    echo "# ACM (AI Configuration Manager)" >> "$PROFILE_FILE"
    echo "$ACM_PATH_EXPORT" >> "$PROFILE_FILE"
    echo "✓ 已添加 PATH 到 $PROFILE_FILE"
fi

echo ""
echo "🎉 ACM 安装完成!"
echo ""
echo "📋 下一步:"
echo "1. 重新加载 shell 配置:"
echo "   source $PROFILE_FILE"
echo ""
echo "   或者重新打开终端"
echo ""
echo "2. 验证安装:"
echo "   acm help"
echo ""
echo "3. 查看可用配置:"
echo "   acm list"
echo ""
echo "4. 编辑配置文件，填入真实的 API 密钥:"
echo "   vim ~/.claude_config"
echo ""
echo "5. 切换到配置:"
echo "   acm use kimi"
echo ""
echo "📖 更多帮助:"
echo "   acm help"
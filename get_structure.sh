#!/bin/bash
# ---------------------------------------------------------
# Serotonic_v3 の「配線図（構造）」だけを抽出するスクリプト
# ---------------------------------------------------------

# treeコマンドがなければ自動インストール
if ! command -v tree &> /dev/null; then
    echo "ツリー表示ツール(tree)をインストールしています..."
    sudo apt-get update && sudo apt-get install tree -y
fi

# 無視する「部品箱（フレームワークの裏側）」のリスト
# これらはあなたが読む必要のないコードです
IGNORE_PATTERN="node_modules|.git|.next|__pycache__|venv|*.pyc"

# ツリー構造を structure.txt に書き出す
echo "プロジェクト構造を解析中..."
tree -a -I "$IGNORE_PATTERN" > structure.txt

echo "出力完了！ エディタで structure.txt を開いてみてください。"

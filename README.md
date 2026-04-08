# 塗料・資材 緊急共有ネット (MVP)

青年部会員向けの「塗料・資材 緊急共有サイト」MVP（Minimum Viable Product）です。
中東情勢の影響などによるシンナー・資材不足に対応するため、会員同士が売りたい情報・買いたい情報を出し合えるシンプルな掲示板として開発されました。

## 概要

- **目的**: 塗料や資材が不足した際に、余っている人と欲しい人をマッチングする情報共有
- **コンセプト**: 「困った時は、仲間で回す。」
- **主な画面**:
  - `index.html`: トップページ / 投稿一覧 (売り・買いタブ切り替え)
  - `post.html`: 投稿ページ
  - `rules.html`: ルール・利用規約ページ

## 技術スタック・構成

外部フレームワークや複雑なビルドツールを使用しない「静的サイト構成」として構築されています。
簡単に GitHub Pages や Vercel にデプロイできる設計です。

- **言語**: Vanilla HTML, CSS, JavaScript
- **データソース**: `/data/posts.json` (ダミーデータ。将来の実装ではAPIやGoogle Apps Scriptなどに接続可能)
- **スタイル**: モバイルファースト・レスポンシブデザイン (BtoB向けシンプルUI)

## フォルダ構成

```
.
├── index.html           # トップページ（投稿一覧）
├── post.html            # 投稿フォームページ
├── rules.html           # ルール・規約・FAQ
├── data/
│   └── posts.json       # ダミー投稿データ
├── assets/
│   ├── css/
│   │   └── style.css    # 全体CSS
│   └── js/
│       └── main.js      # モダンなUI制御（タブ切り替え・モーダル・トースト等）
└── README.md            # 本ファイル
```

## セットアップ方法 (ローカル起動手順)

ローカル環境で動作確認する場合は、簡易的なWebサーバーを起動してください。
(直接 `index.html` をブラウザで開いても動作しますが、 Fetch API を使用して `posts.json` を読み込んでいるため、CORSエラーを避けるためにWebサーバー経由での閲覧を推奨します)

```sh
# 例: Python3 がインストールされている場合
python -m http.server 8000

# 例: Node.js (npx) がインストールされている場合
npx serve .
```

ブラウザで `http://localhost:8000` または `http://localhost:3000` にアクセスしてください。

## GitHub リポジトリ管理・静的公開について

このプロジェクトは、特別なビルドプロセスを必要としない静的ファイル群で構成されています。
したがって、以下の手順でそのまま GitHub Pages や Vercel にデプロイすることが可能です。

### GitHubへのpush
```sh
git init
git add .
git commit -m "Initial commit for MVP"
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### Vercelでの公開
1. Vercelのダッシュボードにログイン
2. "Add New..." から Project を作成し、GitHubリポジトリをインポート
3. Framework Preset を "Other" のまま、Deploy ボタンをクリック
4. 数秒でデプロイが完了します。

## 今後の拡張に向けて (Post-MVP)

現在はダミーデータを読み込み、フォーム送信時に擬似的なトースト通知を出すだけです。
今後バックエンドを構築せず手軽に運用する場合、以下の連携がおすすめです。

- **Google Forms & Spreadsheets**: `post.html` のフォーム送信先を Google Apps Script (GAS) に向け、スプレッドシートに記録。
- **Google Chat Webhook**: GAS トリガーで、新しい投稿があった際に Google Chat へ通知を送信。
- **データ更新**: スプレッドシートの内容を JSON として出力する API エンドポイントを GAS で作成し、`main.js` の `fetch` URL をその Endpoint に差し替える。

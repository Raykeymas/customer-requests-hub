顧客要望管理システムは、企業が顧客からの要望や機能リクエストを一元管理するためのWebアプリケーションです。顧客情報の管理、要望のトラッキング、タグによる分類、進捗状況の可視化などを実現します。

## 機能一覧

- **ユーザー認証**: 登録・ログイン・ログアウト機能
- **ダッシュボード**: 要望の統計情報をチャートで表示
- **要望管理**: 要望の作成・編集・削除・検索・フィルタリング
- **顧客管理**: 顧客情報の登録・編集・検索
- **タグ管理**: カテゴリー別のタグ作成・編集・削除

## 技術スタック

### バックエンド
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT認証

### フロントエンド
- React
- TypeScript
- Material-UI
- React Router
- Axios
- Chart.js

## 環境構築

### 前提条件
- Node.js (v14以上)
- npm または yarn
- MongoDB

### インストール方法

1. リポジトリをクローン
```bash
git clone <repository-url>
cd CustomerManager
```

2. サーバー側の依存関係をインストール
```bash
cd server
npm install
```

3. クライアント側の依存関係をインストール
```bash
cd ../client
npm install
```

### 環境変数の設定

#### サーバー (.env)
.envファイルを作成し、以下の内容を設定してください：

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/customer-request-manager
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

#### クライアント (.env)
.envファイルを作成し、以下の内容を設定してください：

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 実行方法

### サーバーの実行

開発モードで実行：
```bash
cd server
npm run dev
```

本番用にビルドして実行：
```bash
cd server
npm run build
npm start
```

### クライアントの実行

開発モードで実行：
```bash
cd client
npm start
```

本番用にビルド：
```bash
cd client
npm run build
```

## ディレクトリ構成

```
CustomerManager/
├── client/               # フロントエンド
│   ├── public/           # 静的ファイル
│   └── src/              # ソースコード
│       ├── components/   # コンポーネント
│       ├── context/      # コンテキスト（認証など）
│       ├── pages/        # ページコンポーネント
│       └── services/     # API連携サービス
│
└── server/               # バックエンド
    ├── src/              # ソースコード
    │   ├── config/       # 設定
    │   ├── controllers/  # コントローラー
    │   ├── models/       # データモデル
    │   ├── routes/       # APIルート
    │   └── utils/        # ユーティリティ
    └── uploads/          # アップロードファイル保存場所
```

## ユースケース

1. ユーザー登録・ログイン
2. ダッシュボードで統計情報の確認
3. 顧客の追加・管理
4. 要望の登録・更新
5. タグの作成・管理で要望を分類

## 初期アカウント設定

最初のユーザーはアプリケーション上で登録することができます。

## ライセンス

このプロジェクトはMITライセンスです。
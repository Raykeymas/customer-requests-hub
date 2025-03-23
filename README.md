# 顧客要望管理システム

顧客からの要望や機能リクエストを一元管理するためのWebアプリケーションです。顧客情報の管理、要望のトラッキング、タグによる分類、進捗状況の可視化などを実現します。

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
PORT=8000
MONGODB_URI=mongodb://localhost:27017/customer-request-manager
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

#### クライアント (.env)
.envファイルを作成し、以下の内容を設定してください：

```
REACT_APP_API_URL=http://localhost:8000/api
```

## 実行方法

### MongoDBの起動

MongoDBが起動していない場合は、先に起動してください。

```bash
# MacやLinuxの場合
mongod

# Windowsの場合
net start mongodb
```

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

### 初回アクセス方法

1. ブラウザで http://localhost:3000 にアクセス
2. 「登録」ページで新規ユーザーを作成
3. 作成したユーザーでログイン

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

## 使用方法

1. **ユーザー登録・ログイン**
   - ログインページから新規ユーザーを登録またはログイン

2. **ダッシュボード**
   - 要望の統計情報を視覚的に確認

3. **顧客管理**
   - 顧客情報の追加・編集・検索
   - 顧客詳細ページから関連する要望を表示

4. **要望管理**
   - 新規要望の登録
   - ステータス、優先度、タグでのフィルタリング
   - コメントの追加や履歴の確認

5. **タグ管理**
   - カテゴリー別のタグを作成・管理
   - 色付けによる視覚的な区別

## デモデータ

初期データがない場合、統計情報などでサンプルデータが表示されます。実際のデータが登録されると、リアルタイムの情報が表示されるようになります。

## ライセンス

このプロジェクトはMITライセンスです。
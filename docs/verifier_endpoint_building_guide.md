# Verifier Endpoint 構築

- [Verifier Endpoint 構築](#verifier-endpoint-構築)
  - [リポジトリのフォーク（任意）](#リポジトリのフォーク任意)
  - [ローカル開発](#ローカル開発)
    - [モジュールのクローン](#モジュールのクローン)
    - [開発](#開発)
    - [デプロイ](#デプロイ)
      - [Cloudflare 環境](#cloudflare-環境)
    - [環境変数/シークレット](#環境変数シークレット)
      - [各環境共通](#各環境共通)
      - [Cloudflare 環境](#cloudflare-環境-1)
        - [登録手順](#登録手順)

## リポジトリのフォーク（任意）

このリポジトリのトップページの Fork ボタンでリポジトリをフォークする。

## ローカル開発

### モジュールのクローン

```bash
git clone https://github.com/dentsusoken/oid4vc-verifier-endpoint-hono.git
```

（フォークした場合は、URL を変更）

### 開発

依存関係をインストール

```bash
npm install
```

ローカルサーバーを起動する場合は以下のコマンドを実行する。

```bash
npm run dev
```

### デプロイ

#### Cloudflare 環境

1. Cloudflare へのログイン

   以下のコマンドで Cloudflare にログインする。

   ```bash
   npx wrangler login
   ```

   または、API トークンを使用可能。(トークンは Cloudflare の Web コンソールから発行。)

   ```bash
   export CLOUDFLARE_API_TOKEN=<あなたのAPIトークン>
   ```

2. Cloudflare KV を作成

   以下のコマンドで KV を作成する。

   ```bash
   npx wrangler kv namespace create "PRESENTATION_KV"
   ```

   > [!IMPORTANT]
   > コマンド実行後に表示される ID は次の手順で使用。

3. wrangler.toml を編集

wrangler.toml に作成した KV の情報を記載する。
その他の項目についても必要があれば適宜変更。

```toml
[[kv_namespaces]]
binding = "PRESENTATION_KV"
id = "<作成したKVのID>"
```

4. デプロイ

以下のコマンドでアプリケーションのビルド、デプロイを一括で行う。

```bash
npm run deploy
```

### 環境変数/シークレット

#### 各環境共通

| 変数名                    | 説明                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JAR_SIGNING_PRIVATE_JWK` | x5c 属性を含む署名用秘密鍵（作成方法は[こちら](https://github.com/dentsusoken/oid4vc-verifier-endpoint-core/blob/main/docs/jwk_generate/how_to_generate_JWK_with_x509_certificate.md)） |
| `CLIENT_ID`               | `JAR_SIGNING_PRIVATE_JWK`作成時に設定したクライアント ID                                                                                                                                |
| `CLIENT_ID_SCHEME`        | 固定値 `x509_san_dns`                                                                                                                                                                   |
| `PUBLIC_URL`              | Verifier Endpoint 自身の URL                                                                                                                                                            |
| `CORS_ORIGIN`             | Verifier Frontend の オリジン（必要に応じて設定）                                                                                                                                       |

#### Cloudflare 環境

特に固有の環境変数はなし。  
下記手順に従い、共通の環境変数を登録。

##### 登録手順

1. [Cloudflare](https://dash.cloudflare.com/)の Web コンソールにアクセスし、画面左側のメニューから、`Compute` -> `Workers & Pages`を選択。
2. Verifier endpoint のサービスをクリックする。
3. 画面上部のメニューから`Settings`を選択。
4. `Variables and Secrets`の`Add`をクリックしてシークレットを追加する。

# Slack の絵文字の使用回数を取得

# 使用技術
* Node.js
* [Bolt](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started) Slack 公式の Node.js 向けの Slack App 開発用フレームワーク
* [ngrok](https://ngrok.com/) localhost の通信を https につなげてくれるサービス。
* dotenv （開発時に環境変数を保存できる）
* nodemon （開発時に js ファイルを保存するとサーバーを再起動してくれる）


# 必要scope （漏れがあるかも）

## bot user token

* channels:read
* groups:read
* im:read
* mpim:read

* chat:write

## user token
* channels:history
* groups:history
* im:history
* mpim:history

* chat:write


# API method

* [conversations.list](https://api.slack.com/methods/conversations.list)

チャンネル一覧を取得する。


* [conversations.history](https://api.slack.com/methods/conversations.history)

チャンネルのメッセージ一覧を取得する。

* [chat.postMessage](https://api.slack.com/methods/chat.postMessage)

チャンネルにメッセージを送る。


# 注意
* 自分が参加しているチャンネルのメッセージのみ取得可能
* デフォルトで取得できるメッセージはチャンネルごとに 1,000 件まで
* スレッドの返信を取得するには工夫が必要
* user token が　bot のものとそうでないものと二つあるので注意。

# 参考

* [Python×Slack APIで使っていないカスタム絵文字を調べてみました](https://tech.visasq.com/survey-unused-emoji-by-python-slack-sdk/)

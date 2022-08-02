const { App } = require('@slack/bolt');
require("dotenv").config();


// Rate Limits に対応するために非同期で指定したミリ秒だけ待機する。 
//　https://api.slack.com/docs/rate-limits
const sleep = (miliseconds) => new Promise((resolve, reject) => {
    setTimeout(resolve(), miliseconds);
})


// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


/**
 * 全てのパブリックチャンネルを取得する。
 * @returns {Array<string>} チャンネル ID の配列。
 */
const getChannelIDList = async () => {
    try {
        let channels = await app.client.conversations.list({
            token: process.env.SLACK_BOT_TOKEN,
            limit: 500
        });
        let channnelIDList = [];
        for(let channel of channels.channels){
            channnelIDList.push(channel.id);
        }
        return channnelIDList;
    } catch(e) {
        console.log("channnelIDList でエラー");
    }
}


/**
 * 
 * @param {Array<string>} channnelIDList チャンネル ID の配列。
 * @returns {Array<{name: string, count: number}>} 各絵文字の名前と使用回数の object の配列
 */
const getEmojiNums = async (channnelIDList) => {
    let emojiNums = [];
    for(let channnelID of channnelIDList){
        sleep(1000);
        try {
            let history = await app.client.conversations.history({
                token: process.env.SLACK_USER_TOKEN,
                channel: channnelID,
                limit: 1000
            })
            // console.log(history.messages[0]);
            for(let message of history?.messages){
                if(message.reactions == undefined) continue;
                for(let reaction of message.reactions){
                    let emojiIndex = emojiNums.findIndex(elem => elem.name === reaction.name);
                    if(emojiIndex == -1){
                        emojiNums.push({name: reaction.name, count: reaction.count})
                    } else {
                        emojiNums[emojiIndex].count += reaction.count;
                    }
                }
            }
            break;
        } catch(e) {
            console.log("getEmojiNums の中でエラー");
            // console.log(e);
        }
    }
    return emojiNums;
}


// "hello" を含むメッセージをリッスンします。
// 初めにテスト用として app.message で実装。
app.message('hello', async ({ message, say }) => {
    // イベントがトリガーされたチャンネルに say() でメッセージを送信します
    await say(`Hey there <@${message.user}>!`);
    let channnelIDList = await getChannelIDList();

    // 例として、あるチャンネルの絵文字のみを使用
    channnelIDList = ["C038PU562QN"];

    await getEmojiNums(channnelIDList);
    
    console.log(emojiNums);

    // 絵文字を使用回数の多い順に並び替え
    emojiNums.sort((a, b) => b.count - a.count);

    // 使った絵文字とその回数を文字にしてチャンネルにメッセージとして送る。
    let text = "";
    for(let emojiNum of emojiNums){
        text += `:${emojiNum.name}:  ${emojiNum.count}回\n`;
    }
    await say(text)
});


// スラッシュコマンドを使い、多い順に自由な数だけ絵文字の使用回数を送信する。
app.command("/emoji", async({command, context, ack}) => {
    await ack();

    console.log(command.text);

    // 使用回数を送信する絵文字の種類の最大値はデフォルト値は10件まで
    let maxSendNums = 10;
    let sendAll = false;

    if(command.text === "all") {
        // "/emoji all" とコマンドを打ったときは全てを送信する。
        sendAll = true;
    }else if(!isNaN(command.text)) {
        // "/emoji 20" のように数字をつけて送ったときは最大でその数までの種類の絵文字を送信する。
        maxSendNums = parseInt(command.text);
    }

    if(isNaN(maxSendNums)) maxSendNums = 10;

    // 例として、あるチャンネルの絵文字のみを使用。
    // 全チャンネルから取得したいときは、「getChannelIDList」を使用すること。
    let channnelIDList = ["C038PU562QN"]

    let emojiNums = await getEmojiNums(channnelIDList);
    // 絵文字を使用回数の多い順に並び替え
    emojiNums.sort((a, b) => b.count - a.count);

    let text = "各絵文字の使用回数を自動取得\n";
    text += "対象チャンネル："
    for(let channnelID of channnelIDList) {
        text += `<#${channnelID}> `
    }
    text += "\n";

    let nums = 0;
    for(let emojiNum of emojiNums){
        if(!sendAll && nums >= maxSendNums) break;
        text += `\n:${emojiNum.name}:  ${emojiNum.count}回`;
        nums++;
    }


    app.client.chat.postMessage({
        token: process.env.SLACK_USER_TOKEN,
        text: text,
        channel: command.channel_id
    });

});

(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();


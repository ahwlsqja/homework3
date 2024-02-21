import { WebClient } from "@slack/web-api";
const token = process.env.SLACK_TOKEN;
const channel = process.env.SLACK_CHANNEL;
const slackBot = new WebClient(token);


export const sendTodayData = async () => {
    try {
        const message = "요청이 처리되었습니다.";
        await slackBot.chat.postMessage({
            channel: channel,
            text: message,
        });
    } catch (err) {
        console.log(err.message);
    }
};

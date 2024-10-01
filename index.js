require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    

    cron.schedule('0 6 * * *', async () => {
        const guilds = client.guilds.cache;

        for (const guild of guilds.values()) {
            await processGuild(guild);
        }
    }, {timezone: "Asia/Taipei"});
});

async function processGuild(guild) {
    try {
        const invites = await guild.invites.fetch();

        if (!invites.size) {
            console.log(`伺服器 ${guild.name} 沒有邀請連結。`);
            return;
        }

        const channel = guild.channels.cache.get(CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
            console.error(`在伺服器 ${guild.name} 中找不到指定的頻道。`);
            return;
        }

        let report = `伺服器 ${guild.name} 的邀請連結加入人數統計：\n`;

        for (const invite of invites.values()) {
            report += `連結 ${invite.code} - 使用次數：${invite.uses}\n`;
        }

        channel.send(report);
    } catch (error) {
        console.error(`無法獲取伺服器 ${guild.name} 的邀請連結：`, error);
    }
}

client.login(TOKEN);

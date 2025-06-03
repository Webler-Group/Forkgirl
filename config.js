import dotenv from "dotenv";
dotenv.config();

export const config = {
    databaseUri: process.env.DATABASE_URI,
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    openaiKey: process.env.OPENAI_KEY,
    serverId: process.env.SERVER_ID,
    myUserId: process.env.MY_USER_ID
};
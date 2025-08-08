import dotenv from "dotenv";
dotenv.config();

export const config = {
    databaseUri: process.env.DATABASE_URI as string,
    discordBotToken: process.env.DISCORD_BOT_TOKEN as string,
    discordClientId: process.env.DISCORD_CLIENT_ID as string,
    openaiKey: process.env.OPENAI_KEY as string,
    serverId: process.env.SERVER_ID as string
};
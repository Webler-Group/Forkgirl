"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    databaseUri: process.env.DATABASE_URI,
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    openaiKey: process.env.OPENAI_KEY,
    serverId: process.env.SERVER_ID
};

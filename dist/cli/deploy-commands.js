"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
const commands = [
    new discord_js_1.SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies winth pong!"),
    new discord_js_1.SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Create singlechoice question")
        .addStringOption(option => option.setName('topic')
        .setDescription('Question topic')
        .setRequired(true)),
    new discord_js_1.SlashCommandBuilder()
        .setName("purge-word")
        .setDescription("Delete all messages in this channel containing a specific word (Admin only)")
        .addStringOption(option => option
        .setName("word")
        .setDescription("The word to search for and delete messages containing it")
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator) // restrict to admins
        .setContexts(discord_js_1.InteractionContextType.Guild) // only usable in guilds
];
const rest = new discord_js_1.REST({ version: "10" });
rest.setToken(config_1.config.discordBotToken);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield rest.put(discord_js_1.Routes.applicationGuildCommands(config_1.config.discordClientId, config_1.config.serverId), { body: commands.map(x => x.toJSON()) });
            console.log("Slash commands registered.");
        }
        catch (err) {
            console.log(err);
        }
    });
})();

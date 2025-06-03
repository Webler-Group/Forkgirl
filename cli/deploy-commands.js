import { REST, Routes, SlashCommandBuilder } from "discord.js"
import { config } from "../config.js";

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies winth pong!"),
    new SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Create singlechoice question")
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('Question topic')
                .setRequired(true))
];

const rest = new REST({ version: 10 });
rest.setToken(config.discordBotToken);

(async function () {

    try {
        await rest.put(
            Routes.applicationGuildCommands(config.discordClientId, config.serverId),
            { body: commands.map(x => x.toJSON()) }
        );

        console.log("Slash commands registered.");

    } catch (err) {
        console.log(err);
    }

})();
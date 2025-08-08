import { InteractionContextType, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from "discord.js"
import { config } from "../config"

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
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName("purge-word")
        .setDescription("Delete all messages in this channel containing a specific word (Admin only)")
        .addStringOption(option =>
            option
                .setName("word")
                .setDescription("The word to search for and delete messages containing it")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // restrict to admins
        .setContexts(InteractionContextType.Guild) // only usable in guilds
];

const rest = new REST({ version: "10" });
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
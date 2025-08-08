import { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Partials, ActionRowData, AnyComponentBuilder } from "discord.js";
import { config } from "./config";
import { OpenAI } from "openai";

async function main() {

    const openai = new OpenAI({
        apiKey: config.openaiKey,
    });

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Channel]
    });

    client.once("ready", () => {
        console.log("ForkGirl is ready!");
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName == "ping") {
            await interaction.reply("pong");
        } else if (interaction.commandName == "quiz") {
            await interaction.deferReply();

            const topic = interaction.options.getString('topic');
            const prompt = "Create a short singlechoice question on " + topic + ". Format it as JSON with 4 answers where one is correct like following { text: string; answers: { text: string; correct: boolean; }[]; }";

            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                });

                const reply = response.choices[0].message.content;
                const data = reply ? JSON.parse(reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1)) : null;

                if (data?.answers && data.answers.length > 0) {
                    const answerButtons: ButtonBuilder[] = [];
                    for (let i = 0; i < data.answers.length; ++i) {
                        const btn = new ButtonBuilder()
                            .setCustomId("quiz-answer-" + (i + 1) + ";" + (data.answers[i].correct ? "true" : ""))
                            .setLabel(data.answers[i].text)
                            .setStyle(ButtonStyle.Primary);
                        answerButtons.push(btn);
                    }

                    const row = new ActionRowBuilder().addComponents(...answerButtons) as any;

                    await interaction.editReply({
                        content: data.text,
                        components: [row]
                    });
                } else {
                    await interaction.editReply({
                        content: "Something went wrong!"
                    });
                }
            } catch (err) {
                await interaction.editReply({
                    content: "Something went wrong!"
                });
            }
        } else if (interaction.commandName === "purge-word") {
            // Check if user is admin
            if (!interaction.memberPermissions?.has("Administrator")) {
                await interaction.reply({ content: "❌ You must be a server admin to use this command.", ephemeral: true });
                return;
            }

            const word = interaction.options.getString("word");
            if (!word) {
                await interaction.reply({ content: "Please provide a word to search for.", ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.channel;
            if (!channel?.isTextBased()) {
                await interaction.editReply("This command can only be used in text channels.");
                return;
            }

            let deletedCount = 0;
            let lastId: string | undefined;

            try {
                while (true) {
                    const messages = await channel.messages.fetch({ limit: 100, before: lastId });
                    if (messages.size === 0) break;

                    for (const [, msg] of messages) {
                        if (msg.content.includes(word)) {
                            await msg.delete();
                            deletedCount++;
                        }
                    }

                    lastId = messages.last()?.id;
                    if (!lastId) break;
                }

                await interaction.editReply(`✅ Deleted ${deletedCount} messages containing "${word}" in this channel.`);
            } catch (err) {
                console.error(err);
                await interaction.editReply("❌ An error occurred while deleting messages.");
            }
        }

    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("quiz-answer")) {
            const [action, correct] = interaction.customId.split(";");
            await interaction.reply({
                content: interaction.user.displayName + ", " + (correct ? "Correct!" : "Wrong!")
            });
        }
    });

    await client.login(config.discordBotToken);
}

main();
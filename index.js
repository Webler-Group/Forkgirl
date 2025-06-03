import { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { config } from "./config.js";
import { OpenAI } from "openai";
import cron from "node-cron";
import connectDB from "./config/dbConn.js";
import { sendBirthdayreminders } from "./birthday.js";

async function main() {
    //await connectDB();

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
        partials: ["CHANNEL"]
    });

    client.once("ready", () => {
        console.log("ForkGirl is ready!");

        cron.schedule("0 8 * * *", () => sendBirthdayreminders(client), {
            timezone: "Europe/Prague"
        });
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

                let reply = response.choices[0].message.content;
                reply = reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1);
                const data = JSON.parse(reply);

                if (data.answers && data.answers.length > 0) {
                    const answerButtons = [];
                    for (let i = 0; i < data.answers.length; ++i) {
                        const btn = new ButtonBuilder()
                            .setCustomId("quiz-answer-" + (i + 1) + ";" + (data.answers[i].correct ? "true" : ""))
                            .setLabel(data.answers[i].text)
                            .setStyle(ButtonStyle.Primary);
                        answerButtons.push(btn);
                    }

                    const row = new ActionRowBuilder().addComponents(...answerButtons);

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
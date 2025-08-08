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
const config_1 = require("./config");
const openai_1 = require("openai");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = new openai_1.OpenAI({
            apiKey: config_1.config.openaiKey,
        });
        const client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.DirectMessages
            ],
            partials: [discord_js_1.Partials.Channel]
        });
        client.once("ready", () => {
            console.log("ForkGirl is ready!");
        });
        client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!interaction.isChatInputCommand()) {
                return;
            }
            if (interaction.commandName == "ping") {
                yield interaction.reply("pong");
            }
            else if (interaction.commandName == "quiz") {
                yield interaction.deferReply();
                const topic = interaction.options.getString('topic');
                const prompt = "Create a short singlechoice question on " + topic + ". Format it as JSON with 4 answers where one is correct like following { text: string; answers: { text: string; correct: boolean; }[]; }";
                try {
                    const response = yield openai.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                    });
                    const reply = response.choices[0].message.content;
                    const data = reply ? JSON.parse(reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1)) : null;
                    if ((data === null || data === void 0 ? void 0 : data.answers) && data.answers.length > 0) {
                        const answerButtons = [];
                        for (let i = 0; i < data.answers.length; ++i) {
                            const btn = new discord_js_1.ButtonBuilder()
                                .setCustomId("quiz-answer-" + (i + 1) + ";" + (data.answers[i].correct ? "true" : ""))
                                .setLabel(data.answers[i].text)
                                .setStyle(discord_js_1.ButtonStyle.Primary);
                            answerButtons.push(btn);
                        }
                        const row = new discord_js_1.ActionRowBuilder().addComponents(...answerButtons);
                        yield interaction.editReply({
                            content: data.text,
                            components: [row]
                        });
                    }
                    else {
                        yield interaction.editReply({
                            content: "Something went wrong!"
                        });
                    }
                }
                catch (err) {
                    yield interaction.editReply({
                        content: "Something went wrong!"
                    });
                }
            }
            else if (interaction.commandName === "purge-word") {
                // Check if user is admin
                if (!((_a = interaction.memberPermissions) === null || _a === void 0 ? void 0 : _a.has("Administrator"))) {
                    yield interaction.reply({ content: "❌ You must be a server admin to use this command.", ephemeral: true });
                    return;
                }
                const word = interaction.options.getString("word");
                if (!word) {
                    yield interaction.reply({ content: "Please provide a word to search for.", ephemeral: true });
                    return;
                }
                yield interaction.deferReply({ ephemeral: true });
                const channel = interaction.channel;
                if (!(channel === null || channel === void 0 ? void 0 : channel.isTextBased())) {
                    yield interaction.editReply("This command can only be used in text channels.");
                    return;
                }
                let deletedCount = 0;
                let lastId;
                try {
                    while (true) {
                        const messages = yield channel.messages.fetch({ limit: 100, before: lastId });
                        if (messages.size === 0)
                            break;
                        for (const [, msg] of messages) {
                            if (msg.content.includes(word)) {
                                yield msg.delete();
                                deletedCount++;
                            }
                        }
                        lastId = (_b = messages.last()) === null || _b === void 0 ? void 0 : _b.id;
                        if (!lastId)
                            break;
                    }
                    yield interaction.editReply(`✅ Deleted ${deletedCount} messages containing "${word}" in this channel.`);
                }
                catch (err) {
                    console.error(err);
                    yield interaction.editReply("❌ An error occurred while deleting messages.");
                }
            }
        }));
        client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isButton())
                return;
            if (interaction.customId.startsWith("quiz-answer")) {
                const [action, correct] = interaction.customId.split(";");
                yield interaction.reply({
                    content: interaction.user.displayName + ", " + (correct ? "Correct!" : "Wrong!")
                });
            }
        }));
        yield client.login(config_1.config.discordBotToken);
    });
}
main();

import { GatewayIntentBits, Client, Partials, Message } from "discord.js";
import dotenv from "dotenv";
import { load } from "cheerio";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once("ready", () => {
  console.log("Ready!");
  if (client.user) {
    console.log(client.user.tag);
  }
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  if (
    message.content.startsWith("https://www.tulips.tsukuba.ac.jp/opac/volume/")
  ) {
    responseMesssaage(message);
  }
});

client.login(process.env.TOKEN);

const responseMesssaage = (message: Message) => {
  scrapingMessage(message).then((bookInfo) => {
    message.channel.send(bookInfo);
  });
};

const scrapingMessage = async (message: Message): Promise<string> => {
  const url = message.content;
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = load(html);
    const title = $("#lid_intro_major_title").text().trim();
    const author = $("#lid_intro_lead_au").text().trim();
    let imageUrl = $("#lid_intro_thumbnail").attr("src");

    if (imageUrl) {
      imageUrl = `https://www.tulips.tsukuba.ac.jp${imageUrl}`;
    }
    const bookInfo = `タイトル: ${title},\n作者: ${author},\n ${imageUrl}`;
    return bookInfo;
  } catch (err) {
    if (err instanceof Error) {
      console.log("Error: " + err.message);
      return "Error: " + err.message;
    }
    return "An error occurred";
  }
};

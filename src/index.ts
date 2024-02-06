import { GatewayIntentBits, Client, Partials, Message } from "discord.js";
import dotenv from "dotenv";

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
  fetchImageURL(message.content).then((bookInfo) => {
    message.channel.send(`タイトル:${bookInfo.title}`);
    message.channel.send(`著者:${bookInfo.author}`);
    message.channel.send(bookInfo.imageURL);
  });
};

const puppeteer = require("puppeteer");

async function fetchImageURL(pageURL: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageURL, { waitUntil: "networkidle2" });

  const title = await page.evaluate(() => {
    const element = document.querySelector("#lid_intro_major_title");
    return element ? element.textContent : null;
  });

  const author = await page.evaluate(() => {
    const element = document.querySelector("#lid_intro_lead_au");
    return element ? element.textContent : null;
  });

  const imageURL = await page.evaluate(() => {
    const element = document.querySelector("#lid_intro_thumbnail");
    return element ? element.getAttribute("src") : null;
  });

  await browser.close();
  const bookInfo = { title, author, imageURL };
  return bookInfo;
}

import { Telegraf } from "telegraf";
import { config } from "dotenv";
config();

const SURVEY_BOT_KEY = process.env.SURVEY_BOT_KEY;
if (!SURVEY_BOT_KEY) {
  console.log('Bot key is not defined.');
  process.exit(1);
}

const bot = new Telegraf(SURVEY_BOT_KEY);

// Define the different states of the state machine
const states = {
  TITLE: "TITLE",
  START_DATE: "START_DATE",
  END_DATE: "END_DATE",
  END: "END",
};

// Set the initial state of the state machine
let currentState = states.START;
let surveyTitle = "Some title";
let startDate = new Date();

// Define a function to create a survey
async function createPoll(ctx, title, startDate, endDate) {
  // Create a list of options for the survey
  let choices = [];
  const options = { allows_multiple_answers: true, is_anonymous: false };
  let day = startDate;
  while (day.getTime() <= endDate.getTime()) {
    const weekdayName = day.toLocaleDateString("it-IT", { weekday: "long" });
    const monthName = day.toLocaleString("it-IT", { month: "long" });
    choices.push(`${day.getDate()} ${monthName} (${weekdayName})`);
    day = new Date(day.getTime() + 24 * 60 * 60 * 1000) //the day after the current one
    const isLastDay = day.getMonth() === endDate.getMonth() && day.getDate() === endDate.getDate()
    if (choices.length % 10 === 0) {
      // console.log(title, choices, options);
      // Send the survey to the user if we collected 10 choices
      await ctx.replyWithPoll(title, choices, options);
      choices = [];
    }
  }

  // Send remaining choices
  if (choices.length > 0){
    // console.log(title, choices, options);
    await ctx.replyWithPoll(title, choices, options);
  }
}

// Handle the bot's commands
bot.command("start", async (ctx) => {
  // Send a message to the user asking for the survey title
  currentState = states.TITLE;
  await ctx.reply("Inserisci un titolo per il sondaggio di disponibilitá"); //, start date, and end date (in the format YYYY-MM-DD):
});

// Handle the bot's messages
bot.on("message", async (ctx) => {
  // Parse the user's message
  console.log("Got message " + ctx.message.text);

  switch (currentState) {
    case states.TITLE:
      //process survey title
      surveyTitle = ctx.message.text;
      currentState = states.START_DATE;
      await ctx.reply("Inserisci la data di inizio (YYYY-MM-DD)");
      break;
    case states.START_DATE:
      //process survey start date
      startDate = new Date(ctx.message.text);
      currentState = states.END_DATE;
      await ctx.reply("Inserisci la data di fine (YYYY-MM-DD)");
      break;
    case states.END_DATE:
      //process survey end date
      const endDate = new Date(ctx.message.text);
      // Create a new survey
      console.log("Creating Poll");
      await createPoll(ctx, surveyTitle, startDate, endDate);
      console.log("Poll created");
      currentState = states.END;
      break;
  }
});

// Start the bot
bot.launch();

console.log("Survey bot server started");
import { Telegraf } from "telegraf";
import ListService from "./list-service.js";

const LISTS_BOT_KEY = process.env.LISTS_BOT_KEY;
if (!LISTS_BOT_KEY) {
  console.log('Bot key is not defined.');
  process.exit(1);
}

const bot = new Telegraf(LISTS_BOT_KEY);
const listService = new ListService();

bot.command('newlist', async (ctx) => {
  const { message } = ctx;

  const userListsCount = await listService.getUserListsCount(message.from.id);
  if (userListsCount >= 5) {
    ctx.reply('Hai raggiunto il numero massimo di liste (5).');
    return;
  }

  ctx.reply('Inserisci il titolo per la tua nuova lista:');
  bot.on('text', async (ctx) => {
    const title = ctx.message.text;
    const creationDate = new Date().toISOString();
    const result = await listService.createList(message.from.id, title, creationDate);

    if (result) {
      ctx.reply(`Lista "${title}" creata con successo.`);
    } else {
      ctx.reply('Impossibile creare la lista. Riprova.');
    }

    bot.removeMiddleware('text');
  });
});

bot.command('getlists', async (ctx) => {
  const { message } = ctx;
  const lists = await listService.getUserLists(message.from.id);

  if (lists.length > 0) {
    const listTitles = lists.map((list) => `- ${list.title}`).join('\n');
    ctx.reply(`Le tue liste:\n${listTitles}`);
  } else {
    ctx.reply('Non hai nessuna lista.');
  }
});

bot.command('additem', async (ctx) => {
  ctx.reply('Inserisci il titolo della lista a cui vuoi aggiungere un elemento:');
  bot.on('text', async (ctx) => {
    const listTitle = ctx.message.text;
    const list = await listService.getListByTitle(ctx.message.from.id, listTitle);

    if (!list) {
      ctx.reply(`Lista "${listTitle}" non esiste.`);
      bot.removeMiddleware('text');
      return;
    }

    ctx.reply('Inserisci l\'elemento che vuoi aggiungere alla lista:');
    bot.on('text', async (ctx) => {
      const item = ctx.message.text;
      const result = await listService.addItemToList(list.id, item);

      if (result) {
        ctx.reply(`Elemento "${item}" aggiunto alla lista "${list.title}" con successo.`);
      } else {
        ctx.reply('Impossibile aggiungere l\'elemento alla lista. Riprova.');
      }

      bot.removeMiddleware('text');
    });
  });
});

bot.command('removeitem', async (ctx) => {
  ctx.reply('Inserisci il titolo della lista da cui vuoi rimuovere un elemento:');
  bot.on('text', async (ctx) => {
    const listTitle = ctx.message.text;
    const list = await listService.getListByTitle(ctx.message.from.id, listTitle);

    if (!list) {
      ctx.reply(`Lista "${listTitle}" non esiste.`);
      bot.removeMiddleware('text');
      return;
    }

    ctx.reply('Inserisci l\'elemento che vuoi rimuovere dalla lista:');
    bot.on('text', async (ctx) => {
      const item = ctx.message.text;
      const result = await listService.removeItemFromList(list.id, item);

      if (result) {
        ctx.reply(`Elemento "${item}" rimosso dalla lista "${list.title}" con successo.`);
      } else {
        ctx.reply('Impossibile rimuovere l\'elemento dalla lista. Riprova.');
      }

      bot.removeMiddleware('text');
    });
  });
});

bot.launch();

console.log("List bot server started");
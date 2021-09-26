# ZyapBot N
## _A Discord bot built with node.js for zyapguy's Discord server_

Zyapbot is a Discord bot made with node.js.

## Features

- Ban, Silentban, Unban, Kick users
- Purge messages
- Make polls, List social media accounts
- Add roles, remove roles
- User info

## Tech

ZyapBot uses a number of open source projects to work properly:

- [NodeJS](https://nodejs.org/en/) - Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Discord.JS](https://discord.js.org/) - a powerful Node.js module that allows you to interact with the Discord API very easily.
- [nodemon](https://www.npmjs.com/package/nodemon) - nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [discordjs-button-pagination](https://www.npmjs.com/package/discordjs-button-pagination) - A simple package to paginate discord embeds via discord buttons introduced in discord.js v13.

And of course ZyapBot itself is open source with a [public repository][dill] on GitHub.

## Installation

ZyapBot requires [Node.js](https://nodejs.org/) v16+ to run.

Install the dependencies and start the server.

```sh
cd ZyapBot
npm i
node index.js
```

For production environments...

```sh
npm install --production
NODE_ENV=production node index.js
```

## Integration

If you want to integrate ZyapBot into your own server, change the functions:

- ```roleToString()```
- ```purgeAuthorityValues()```

to your servers staff values. If you don't do this, the bot cannot function correctly!

## Development

Want to contribute? Great!

ZyapBot uses nodemon for fast developing.
Make a change in your file and instantaneously see your updates!

Open your favorite Terminal and run these commands.

```sh
nodemon index.js
```

## License

MIT

**Free Software, Hell Yeah!**

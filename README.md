# DSF-Discord-Bot
>Daily Stupid Facts Robot for [Discord](https://discord.com/) Servers  
  
Click here: [Invite Link](https://discord.com/oauth2/authorize?client_id=733410082607333536&scope=bot&permissions=451025435968)
  
## Other Information
Guest Web Client hosted on [localhost:8080](http://localhost:8080/)  
Admin Web Client hosted on [localhost:8081](http://localhost:8081/)
  
## Build Setup
1. Follow [these instructions](https://discordpy.readthedocs.io/en/latest/discord.html) on how to set up a bot with Discord.
2. Retrieve your bot specific client id/token.
3. In the directory DSF-Discord-Bot/client, create a file called config.js modeled off of the template.  
Example:  

``` javascript
module.exports = { token: YOUR_TOKEN_HERE }
```
4. Run the following commands:  

``` bash
# install dependencies
npm install

# start Discord bot
start scripts/start_dsf_bot.bat
```

### Note
If you would like to enable the 'dsf!restart' command or the shut-up easter egg, put a Discord userId and/or bot userId in token.js as such:

``` javascript
module.exports = { token: TOKEN, adminId: USER_ID_HERE, botId: BOT_USER_ID_HERE }
```

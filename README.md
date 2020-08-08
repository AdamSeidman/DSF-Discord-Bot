# DSF-Discord-Bot
>Daily Stupid Facts Robot for Discord Servers  
  
Click here: [Invite Link](https://discord.com/oauth2/authorize?client_id=733410082607333536&permissions=775945664&scope=bot)
  
## Other Information
Guest Web Client hosted on [localhost:8080](http://localhost:8080/)  
Admin Web Client hosted on [localhost:8081](http://localhost:8081/)
  
## Build Setup
1. Follow [these instructions](https://discordpy.readthedocs.io/en/latest/discord.html) on how to set up a bot with Discord.
2. Retrieve your bot specific client id/token.
3. In the directory DSF-Discord-Bot/Client, create a file called token.js.  
Example:  

``` javascript
module.exports = { token: YOUR_TOKEN_HERE }
```
4. Run the following commands:  

``` bash
# install dependencies
npm install

# start Discord bot
cd scripts  
start start_dsf_bot.bat
```

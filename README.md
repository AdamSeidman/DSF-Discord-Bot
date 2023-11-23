# DSF-Discord-Bot
>Daily Stupid Facts Robot for [Discord](https://discord.com/) Servers  
  
Click here: [Invite Link](https://discord.com/oauth2/authorize?client_id=733410082607333536&scope=bot&permissions=451025435968)
  
## Other Information
Web Client hosted on [localhost:8080](http://localhost:8080/)
The port can be changed in config.json.

The sound effects are no longer located in this repository to allow for customization and re-use.
They are in this repo as a submodule. See the sound effects [here](https://github.com/AdamSeidman/DSF-Effects).

## Build Setup
1. Follow [these instructions](https://discordpy.readthedocs.io/en/latest/discord.html) on how to set up a bot with Discord.
2. Retrieve your bot specific client id/token.
3. In the directory DSF-Discord-Bot/client, create a file called config.json modeled off of the template in that folder.  
4. Run the following commands:  

``` bash
# install dependencies
npm install

# start Discord bot
start scripts/start_dsf_bot.bat
```

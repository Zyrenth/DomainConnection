# Discord Domain Connection
Integrates with your Cloudflare account so you can share your funny domain with your friends.
This is related to the new Discord feature called Domain Connections.

# How does it work?
1. It uses Discord OAuth to limit who can log in and use this web-app.
2. The web-app communicated through socket.io and can receive real-time data.
  - *The only reason this web-app uses socket.io instead of rest API is that I stole a part of the code from one of my other project.*
3. It uses the Cloudflare API to update/create TXT records on your domain.
4. That's all, it's a really simple explanation but if you can code you'll understand the code anyways.

# Setting up
## Empty .env
```dotenv
EXPRESS_SECRET="your secret"
CLIENT_ID="" # Discord Client ID
CLIENT_SECRET="" # Discord Client Secret
CLOUDFLARE_API_KEY="" # Cloudflare API Key
```

## Discord Client ID, Secret and Redirect URI
1. Go to the [Developer Portal](https://discord.com/developers/applications) create a new Application and go to OAuth2, copy and paste the Client ID and Secret to your .env file.
2. Add your redirect URI, if you're running this locally add `http://localhost:8000/auth`, if not then you know where you're gonna deploy this web-app. (Make sure the redirect URI ends with `/auth`).

## Cloudflare API Token/Key
1. Go to [your profile > API tokens](https://dash.cloudflare.com/profile/api-tokens) and click create a token.
2. Use the edit zone DNS template, you can add filtering so only your IP address is allowed but that's not necessarry.
3. Copy and paste the generated token to your .env file.

## Express secret
Just set any secret you want, the easiest one which I recommend is generating a random string or password and setting that.
This secret is just for the sessions and it's not required to access the site, but don't share the secret you set with anyone.

# Configuration
## Empty config.json
```json
{
    "allowed_users": ["your discord id", "another discord id"],
    "socket_port": 4000,
    "http_port": 8000,
    "cors": ["http://localhost:8000", "http://localhost:4000"],
    "discord_auth_url": "",
    "discord_redirect_uri": "http://localhost:8000/auth",
    "domain": "your domain"
}
```

## Allowed users
You can add allowed users who can access the web-app.
Copy the ID of the user and add it to the allowed users array.

## Ports
The `http_port` is the web-app's port which is how you access the website and `socket_port` is the socket.io port for communication. **Make sure to update the CORS URLs as well!**

> **Warning**
> Currently the web-app connects to the same hostname and protocol for socket.io if you're exposing the socket.io connection on a different hostname or protocol you need to modify the code at [public/script.js:11](public/script.js).

## Discord Auth URL and Redirect URI
1. Go back to the [Developer Portal](https://discord.com/developers/applications) and select the application you created earlier.
2. Go to OAuth2 > URL Generator.
3. Select the `identify` scope and the redirect URI you added earlier.
4. Copy the generated URL and set it as `discord_auth_url`.
5. Set the `discord_redirect_uri` as the same redirect URI you added earlier in the Developer Portal.

## Domain
Set the domain to a domain that you already own and already added to your Cloudflare account.

# Future
I don't really plan on updating this but feel free to make forks, change stuff in it.
I might add a section for cool forks of this web-app, but to do that you have to open an issue and share the fork with me there.
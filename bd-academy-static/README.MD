## Run on server

to run this static type pm2 start index.js in folder `/home/ilms-static-braindance/htdocs`

no static api will be available on Address `http://185.201.114.251:5008/`

## Run on windows
```node.exe index.js```

## Generate new ssl cert
Use certbot to generate new cert `sudo certbot certonly --manual -d ilms.seemymodel.com --preferred-challenges dns-01`
Upload to static server. Files needs name `server.crt` and `server.key`
Restart service.
Upload ssl cert into folders `C:\xampp\apache\conf\ssl.key` and `C:\xampp\apache\conf\ssl.crt`
Restart apache in xampp
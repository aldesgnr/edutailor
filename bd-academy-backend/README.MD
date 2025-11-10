# Backend

Stack:

- C#
- ASPNET/.Net7.0/EntityFramework
- mysql
- OpenApi

## Develop

Only on Windows / WSL not working fast.

### Run

To run API open `./bd-academy-backend/bd-academy-backend.sln` in Visual Studio, select "DockerCompose" project and run

### Create database

```
dotnet tool install --global dotnet-ef
cd  bd-academy-backend
dotnet ef database update
```

### Migrations

After adding some Entity Models in the code you need to generate migration file:

```
dotnet ef migrations add <migration-name>
```

and then update the database with

```
dotnet ef database update
```

### Generate api client code

Open powershell and run

```ps
cd bd-academy-backend
dotnet tool restore
```

to install necessary tools

```ps
./generate-api-clients.ps1
```

Code is generated to `bd-academy-backend\api-clients` and copied to frontend application in `bd-academy-backend\src\api-client`

### Create build

`dotnet build` to folder `bd-academy-backend\bd-academy-backend/bin/Debug`

### Run build on server

`dotnet bd-academy-backend.dll` this not working at `http://http://185.201.114.251`. To run this just type in console `systemctl start ilms-api`

### Update db

At dev server `http://http://185.201.114.251` `dotnet database update` not working. Just drop database `academy`, and run `systemctl restart ilms-api`.

### Backend appsettings

Copy this to `/home/ilms-braindance/htdocs/braindance.ilms.api/api/appsettings.Development.json` and change `DB_PASSWORD`.

```
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Urls": "http://185.201.114.251:5007",
  "Database": {
    "DB_SERVER": "127.0.0.1",
    "DB_PORT": "3306",
    "DB_NAME": "academy",
    "DB_USER": "root",
    "DB_PASSWORD": "MAGIC_PASSOWRD"
  }
}
```
## Run
### Windows
Use xampp and start MySql Server.
Use `dotnet run` in bd-academy-backend/bd-academy-backend.

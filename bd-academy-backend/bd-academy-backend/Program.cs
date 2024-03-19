using bd_academy_backend;
using bd_academy_backend.Config;
using bd_academy_backend.Modules.Shared.Services;
using bd_academy_backend.Modules.User.Models;
using bd_academy_backend.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

ConfigurationManager configuration = builder.Configuration;

// For Entity Framework
var databaseCreds = configuration.GetSection("Database").Get<ConnectionString>();
var conn = databaseCreds?.Connection;
builder.Services.AddDbContext<AppDBContext>(options => options.UseMySql(conn, ServerVersion.AutoDetect(conn), b => b.MigrationsAssembly("bd-academy-backend")));



// For Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDBContext>()
    .AddDefaultTokenProviders();

//Service to provide required database data
builder.Services.AddScoped<DataProvider>();

//Modules services dependencies
builder.Services.AddUserModuleDependencies();

// Adding Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
// Adding Jwt Bearer
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,

        ValidAudience = configuration["JWT:ValidAudience"],
        ValidIssuer = configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]))
    };
});

builder.Services.AddControllers().AddJsonOptions(x =>
{
    x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{
    var info = new OpenApiInfo { Title = "API", Version = "v1" };
    options.SwaggerDoc(name: "v1", info: info);
    options.OperationFilter<SecurityRequirementsOperationFilter>();

});

//CORS
var CORSPolicyName = "allowSpecificOrigins";
var allowedOrigins = configuration.GetValue<string>("AllowedHosts");
if (allowedOrigins == null) allowedOrigins = "*";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CORSPolicyName,
                          policyBuilder =>
                          {
                              policyBuilder.WithOrigins("*")
                                                  .AllowAnyHeader()
                                                  .AllowAnyMethod();
                          });
});

//Add user secrets on dev mode to enable https certificates
if (builder.Environment.IsDevelopment() || builder.Environment.EnvironmentName.Equals("DevelopmentDocker"))
{
    builder.Configuration.AddUserSecrets<Program>();
}

var app = builder.Build();

// Enable swagger docs page in dev mode
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName.Equals("DevelopmentDocker"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapSwagger().RequireAuthorization();
}

app.UseCors(CORSPolicyName);

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    //Catch errors in order to swagger code generation tool to work 
    try
    {
        var dataProvider = scope.ServiceProvider.GetRequiredService<DataProvider>();
        await dataProvider.CreateRoles();
        await dataProvider.CreateAdmin();
    }
    catch
    {
        Console.WriteLine("Could not create required data in database");
    }

}

app.Run();

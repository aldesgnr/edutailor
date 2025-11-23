# 📁 BACKEND - SZCZEGÓŁOWY OPIS PLIKÓW

## bd-academy-backend - Struktura C#/.NET

---

## 🎯 Pliki główne

### `bd-academy-backend.sln`
**Przeznaczenie:** Visual Studio solution file

**Projekty:**
- `bd-academy-backend.csproj` - główny projekt API
- `docker-compose.dcproj` - Docker orchestration

### `bd-academy-backend.csproj`
**Przeznaczenie:** Definicja projektu .NET

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" />
    <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" />
    <PackageReference Include="Swashbuckle.AspNetCore" />
  </ItemGroup>
</Project>
```

**Key dependencies:**
- `Entity Framework Core` - ORM
- `Pomelo MySQL` - MySQL provider
- `Identity` - autentykacja
- `Swagger` - API docs

---

## 📄 Program.cs
**Przeznaczenie:** Entry point aplikacji

**Konfiguracja:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Services
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDBContext>(options => 
  options.UseMySql(connectionString, ServerVersion.AutoDetect(conn))
);
builder.Services.AddIdentity<User, IdentityRole>()
  .AddEntityFrameworkStores<AppDBContext>();

// 2. JWT Authentication
builder.Services.AddAuthentication(options => {
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
  options.TokenValidationParameters = new TokenValidationParameters {
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidIssuer = configuration["JWT:ValidIssuer"],
    IssuerSigningKey = new SymmetricSecurityKey(
      Encoding.UTF8.GetBytes(configuration["JWT:Secret"])
    )
  };
});

// 3. CORS
builder.Services.AddCors(options => {
  options.AddPolicy("allowSpecificOrigins", policy => {
    policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
  });
});

// 4. Swagger
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. Middleware pipeline
app.UseCors("allowSpecificOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Flow:**
1. Configuration services
2. Build app
3. Setup middleware pipeline
4. Start listening

---

## 📄 AppDBContext.cs
**Przeznaczenie:** Entity Framework DbContext

```csharp
public class AppDBContext : IdentityDbContext<User>
{
  public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) {}
  
  // DbSets (tables)
  public DbSet<Training> Training { get; set; }
  public DbSet<TrainingSection> TrainingSection { get; set; }
  public DbSet<TrainingSectionComponent> TrainingSectionComponent { get; set; }
  public DbSet<TrainingValue> TrainingValue { get; set; }
  public DbSet<TrainingFavorite> TrainingFavorite { get; set; }
  public DbSet<TrainingFile> TrainingFile { get; set; }
  
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    // Relationships, indexes, constraints
  }
}
```

**Odpowiedzialności:**
- Definiuje tabele (DbSet)
- Konfiguruje relacje (OnModelCreating)
- Dostęp do bazy przez LINQ

---

## 📂 Modules/Auth/

### `AuthController.cs`
**Przeznaczenie:** Endpoint autentykacji

**Endpoints:**
```csharp
[Route("auth")]
[ApiController]
public class AuthController : ControllerBase
{
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginDTO model)
  {
    // 1. Znajdź użytkownika
    var user = await _userManager.FindByEmailAsync(model.Email);
    
    // 2. Sprawdź hasło
    if (!await _userManager.CheckPasswordAsync(user, model.Password))
      return Unauthorized();
    
    // 3. Generuj JWT token
    var token = CreateToken(authClaims);
    var refreshToken = GenerateRefreshToken();
    
    return Ok(new { accessToken = token, refreshToken });
  }
  
  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterDTO model)
  {
    // 1. Sprawdź czy user istnieje
    var existingUser = await _userManager.FindByEmailAsync(model.Email);
    if (existingUser != null)
      return BadRequest("User already exists");
    
    // 2. Stwórz użytkownika
    var user = new User { 
      Email = model.Email, 
      UserName = model.Email 
    };
    var result = await _userManager.CreateAsync(user, model.Password);
    
    if (!result.Succeeded)
      return BadRequest(result.Errors);
    
    // 3. Przypisz role
    await _userManager.AddToRoleAsync(user, "User");
    
    return Ok();
  }
  
  [HttpPost("forgot-password")]
  public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO model)
  {
    var user = await _userManager.FindByEmailAsync(model.Email);
    if (user == null) return NotFound();
    
    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
    // Send email with token
    return Ok();
  }
  
  [HttpPost("reset-password")]
  public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO model)
  {
    var user = await _userManager.FindByEmailAsync(model.Email);
    var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
    
    return result.Succeeded ? Ok() : BadRequest(result.Errors);
  }
}
```

**Private helper:**
```csharp
private string CreateToken(List<Claim> authClaims)
{
  var authSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(_configuration["JWT:Secret"])
  );
  
  var token = new JwtSecurityToken(
    issuer: _configuration["JWT:ValidIssuer"],
    audience: _configuration["JWT:ValidAudience"],
    expires: DateTime.Now.AddMinutes(15),
    claims: authClaims,
    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
  );
  
  return new JwtSecurityTokenHandler().WriteToken(token);
}
```

---

## 📂 Modules/Training/

### `Models/Training.cs`
**Przeznaczenie:** Entity model dla treningu

```csharp
[PrimaryKey(nameof(Id))]
public class Training
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string Image { get; set; } = string.Empty;
  public int DurationTime { get; set; } = 0;
  public string Type { get; set; } = "DRAFT"; // DRAFT | PUBLISHED
  public bool Published { get; set; } = false;
  public DateTime AvailableUntil { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.Now;
  public DateTime? UpdatedAt { get; set; }
  public DateTime? DeletedAt { get; set; } // Soft delete
  
  // Relationships
  [InverseProperty("Training")]
  public List<TrainingSection> TrainingSections { get; set; } = new();
  public List<TrainingValue> TrainingValue { get; set; } = new();
  public List<TrainingFile> TrainingFiles { get; set; } = new();
  public List<TrainingFavorite> TrainingFavorite { get; set; } = new();
  
  // DTO conversion
  public TrainingDTO toDTO() { /* ... */ }
  public Training fromDTO(TrainingDTO dto) { /* ... */ }
}
```

### `Models/TrainingSection.cs`
```csharp
public class TrainingSection
{
  public Guid Id { get; set; }
  public string Title { get; set; }
  public Guid TrainingId { get; set; }
  
  [ForeignKey("TrainingId")]
  public Training Training { get; set; }
  
  public List<TrainingSectionComponent> TrainingSectionComponents { get; set; } = new();
}
```

### `Models/TrainingSectionComponent.cs`
```csharp
public class TrainingSectionComponent
{
  public Guid Id { get; set; }
  public string Title { get; set; }
  public string Description { get; set; }
  public string Type { get; set; } // QUIZ | FILE | SCENE
  public Guid? DialogId { get; set; } // Link do pliku dialogu
  public Guid TrainingSectionId { get; set; }
  
  [ForeignKey("TrainingSectionId")]
  public TrainingSection TrainingSection { get; set; }
}
```

### `Controllers/TrainingsController.cs`
**Przeznaczenie:** CRUD dla treningów

```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TrainingsController : ControllerBase
{
  private readonly AppDBContext _context;
  
  [HttpGet]
  public async Task<ActionResult<IEnumerable<TrainingDTO>>> GetTrainings()
  {
    var trainings = await _context.Training
      .Include(t => t.TrainingSections)
        .ThenInclude(s => s.TrainingSectionComponents)
      .Where(t => t.DeletedAt == null)
      .ToListAsync();
    
    return Ok(trainings.Select(t => t.toDTO()));
  }
  
  [HttpGet("{id}")]
  public async Task<ActionResult<TrainingDTO>> GetTraining(Guid id)
  {
    var training = await _context.Training
      .Include(t => t.TrainingSections)
      .FirstOrDefaultAsync(t => t.Id == id);
    
    return training == null ? NotFound() : Ok(training.toDTO());
  }
  
  [HttpPost]
  public async Task<ActionResult<TrainingDTO>> CreateTraining(TrainingDTO dto)
  {
    var training = new Training().fromDTO(dto);
    _context.Training.Add(training);
    await _context.SaveChangesAsync();
    
    return CreatedAtAction(nameof(GetTraining), new { id = training.Id }, training.toDTO());
  }
  
  [HttpPut("{id}")]
  public async Task<IActionResult> UpdateTraining(Guid id, TrainingDTO dto)
  {
    var training = await _context.Training.FindAsync(id);
    if (training == null) return NotFound();
    
    training.fromDTO(dto);
    training.UpdatedAt = DateTime.Now;
    await _context.SaveChangesAsync();
    
    return NoContent();
  }
  
  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteTraining(Guid id)
  {
    var training = await _context.Training.FindAsync(id);
    if (training == null) return NotFound();
    
    training.DeletedAt = DateTime.Now; // Soft delete
    await _context.SaveChangesAsync();
    
    return NoContent();
  }
}
```

---

## 📂 Modules/User/

### `Models/User.cs`
```csharp
public class User : IdentityUser
{
  // Dodatkowe pola oprócz Identity
  public string? FirstName { get; set; }
  public string? LastName { get; set; }
  public DateTime? RefreshTokenExpiryTime { get; set; }
}
```

### `UserService.cs`
```csharp
public class UserService
{
  private readonly UserManager<User> _userManager;
  
  public async Task<User> GetUserByIdAsync(string userId)
  {
    return await _userManager.FindByIdAsync(userId);
  }
  
  public async Task<IdentityResult> UpdateUserAsync(User user)
  {
    return await _userManager.UpdateAsync(user);
  }
}
```

---

## 📂 Config/

### `ConnectionString.cs`
```csharp
public class ConnectionString
{
  public string DB_SERVER { get; set; }
  public string DB_PORT { get; set; }
  public string DB_NAME { get; set; }
  public string DB_USER { get; set; }
  public string DB_PASSWORD { get; set; }
  
  public string Connection => 
    $"server={DB_SERVER};port={DB_PORT};database={DB_NAME};user={DB_USER};password={DB_PASSWORD}";
}
```

---

## 📄 appsettings.json
```json
{
  "Database": {
    "DB_SERVER": "127.0.0.1",
    "DB_PORT": "3306",
    "DB_NAME": "academy",
    "DB_USER": "root",
    "DB_PASSWORD": "password"
  },
  "JWT": {
    "ValidAudience": "User",
    "ValidIssuer": "https://localhost:5007",
    "Secret": "YourSecretKeyHere123456789"
  },
  "AllowedHosts": "*"
}
```

---

## 🔄 Migrations/

**Jak działa:**
```bash
# Dodaj migrację
dotnet ef migrations add MigrationName

# Zastosuj do bazy
dotnet ef database update

# Rollback
dotnet ef database update PreviousMigrationName
```

**Pliki:**
- `20231101_InitialCreate.cs` - definicja schematu
- `20231101_InitialCreate.Designer.cs` - metadata
- `AppDBContextModelSnapshot.cs` - aktualny stan

---

## 📜 API Client Generation

### `generate-api-clients.ps1`
```powershell
# 1. Build backend
cd ./bd-academy-backend

# 2. Generuj OpenAPI spec
dotnet swagger tofile --output api-clients\openapi.json `
  ./bd-academy-backend/bin/Debug/net7.0/bd-academy-backend.dll "v1"

# 3. Generuj TypeScript client (Docker)
docker run --rm -v "${pwd}:/local" `
  openapitools/openapi-generator-cli generate `
  -i /local/api-clients/openapi.json `
  -g typescript-axios `
  -o /local/api-clients/typescript-axios

# 4. Kopiuj do frontendu
copy api-clients/typescript-axios/* ..\bd-academy\src\api-client\ -Recurse -Force

cd ..
```

**Output:**
- `api-clients/openapi.json` - OpenAPI specification
- `api-clients/typescript-axios/` - Generated TS client
- `bd-academy/src/api-client/` - Frontend API client

**Ostatnia aktualizacja:** 2025-11-11

using bd_academy_backend.Modules.TrainingNamespace.Models;
using bd_academy_backend.Modules.User.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace bd_academy_backend
{
    public class AppDBContext : IdentityDbContext<User>
    {



        public AppDBContext(DbContextOptions<AppDBContext> options)
        : base(options)
        {


        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

        }

        public DbSet<Training> Training { get; set; } = null!;
        public DbSet<Training_TrainingCreator> Training_TrainingCreator { get; set; } = null!;

        public DbSet<TrainingCreator> TrainingCreator { get; set; } = null!;
        public DbSet<TrainingFavorite> TrainingFavorite { get; set; } = null!;
        public DbSet<TrainingFile> TrainingFile { get; set; } = null!;
        public DbSet<TrainingValue> TrainingValue { get; set; } = null!;
        public DbSet<TrainingSection> TrainingSection { get; set; } = null!;
        public DbSet<TrainingSectionComponent> TrainingSectionComponent { get; set; } = null!;




    }
}

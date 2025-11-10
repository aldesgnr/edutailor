using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;



namespace bd_academy_backend.Modules.TrainingNamespace.Models
{

    [PrimaryKey(nameof(Id))]
    public class TrainingCreator
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to one
        public string UserId { get; set; } = null!;
        [ForeignKey("UserId")]
        public User.Models.User User { get; set; } = null!;

        // Relationships one to many
        public List<Training_TrainingCreator> Training_TrainingCreator { get; set; } = new List<Training_TrainingCreator>();
        public List<TrainingFavorite> TrainingFavorite { get; set; } = new List<TrainingFavorite>();
    }
}

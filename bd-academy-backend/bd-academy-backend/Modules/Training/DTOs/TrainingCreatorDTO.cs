using System.ComponentModel.DataAnnotations;

namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{


    public class TrainingCreatorDTO
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid Training { get; set; }
        public Guid User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

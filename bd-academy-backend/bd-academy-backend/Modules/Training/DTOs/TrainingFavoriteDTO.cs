namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{


    public class TrainingFavoriteDTO
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? TrainingId { get; set; }
        public Guid? TrainingCreatorId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

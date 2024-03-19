namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{


    public class TrainingSectionComponentDTO
    {

        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; }
        public Guid? DialogId { get; set; } = null;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

    }
}

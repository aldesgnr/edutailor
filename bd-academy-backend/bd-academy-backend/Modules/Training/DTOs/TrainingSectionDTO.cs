namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{


    public class TrainingSectionDTO
    {

        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public List<TrainingSectionComponentDTO> TrainingSectionComponents { get; set; } = new List<TrainingSectionComponentDTO>();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

    }
}

namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{


    public class TrainingDTO
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public List<string> TrainingValue { get; set; } = new List<string>();
        public List<TrainingSectionDTO> TrainingSections { get; set; } = new List<TrainingSectionDTO>();
        public int DurationTime { get; set; } = 0;
        public string Type { get; set; } = "DRAFT";
        public bool Published { get; set; } = false;
        public DateTime AvailableUntil { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool Favorite { get; set; } = false;
    }
}

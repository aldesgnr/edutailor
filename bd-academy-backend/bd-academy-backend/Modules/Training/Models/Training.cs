using bd_academy_backend.Modules.TrainingNamespace.DTO;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace bd_academy_backend.Modules.TrainingNamespace.Models
{


    [PrimaryKey(nameof(Id))]
    public class Training
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public int DurationTime { get; set; } = 0;
        public string Type { get; set; } = "DRAFT";
        public bool Published { get; set; } = false;
        public DateTime AvailableUntil { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to many
        [InverseProperty("Training")]
        public List<TrainingValue> TrainingValue { get; set; } = new List<TrainingValue>();
        public List<Training_TrainingCreator> Training_TrainingCreator { get; set; } = new List<Training_TrainingCreator>();
        public List<TrainingFile> TrainingFiles { get; set; } = new List<TrainingFile>();
        [InverseProperty("Training")]
        public List<TrainingSection> TrainingSections { get; set; } = new List<TrainingSection>();
        public List<TrainingFavorite> TrainingFavorite { get; set; } = new List<TrainingFavorite>();


        //create function converts db model to DTO model
        public TrainingDTO toDTO()
        {
            TrainingDTO trainingDTO = new TrainingDTO();
            trainingDTO.Id = this.Id;
            trainingDTO.Title = this.Title;
            trainingDTO.Description = this.Description;
            trainingDTO.Image = this.Image;
            trainingDTO.DurationTime = this.DurationTime;
            trainingDTO.AvailableUntil = this.AvailableUntil;
            trainingDTO.TrainingValue = this.TrainingValue.Select(trainingValue => trainingValue.Value).ToList();
            trainingDTO.TrainingSections = this.TrainingSections.Select(trainingSection => trainingSection.toDTO()).ToList();
            trainingDTO.Type = this.Type;
            trainingDTO.Published = this.Published;
            trainingDTO.CreatedAt = this.CreatedAt;
            trainingDTO.DeletedAt = this.DeletedAt;
            trainingDTO.UpdatedAt = this.UpdatedAt;
            return trainingDTO;
        }


        public Training fromDTO(TrainingDTO trainingDTO)
        {
            this.Id = trainingDTO.Id;
            this.Title = trainingDTO.Title;
            this.Description = trainingDTO.Description;
            this.Image = trainingDTO.Image;
            this.DurationTime = trainingDTO.DurationTime;
            this.Type = trainingDTO.Type;
            this.Published = trainingDTO.Published;
            this.AvailableUntil = trainingDTO.AvailableUntil;
            this.CreatedAt = trainingDTO.CreatedAt;
            this.DeletedAt = trainingDTO.DeletedAt;
            this.UpdatedAt = trainingDTO.UpdatedAt;

            return this;

        }


    }


}

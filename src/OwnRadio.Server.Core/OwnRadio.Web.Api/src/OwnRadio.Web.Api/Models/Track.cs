using System;

namespace OwnRadio.Web.Api.Models
{
    public class Track
    {
        public Guid Id { get; set; }

        public string Path { get; set; }

        public DateTime Uploaded { get; set; }
    }
}
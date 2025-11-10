using System.Text;

namespace bd_academy_backend.Config
{
    public class ConnectionString
    {
        public string DB_SERVER { get; set; }
        public string DB_PORT { get; set; }
        public string DB_NAME { get; set; }
        public string DB_USER { get; set; }
        public string DB_PASSWORD { get; set; }
        public string Connection
        {
            get
            {
                StringBuilder sb = new StringBuilder();
                sb.Append(ConnectionStringConstants.Server + DB_SERVER + ";");
                sb.Append(ConnectionStringConstants.Port + DB_PORT + ";");
                sb.Append(ConnectionStringConstants.Database + DB_NAME + ";");
                if (string.IsNullOrEmpty(DB_USER))
                {
                    sb.Append(ConnectionStringConstants.TrustedConnection);
                }
                else
                {
                    sb.Append(ConnectionStringConstants.UserId + DB_USER + ";");
                    sb.Append(ConnectionStringConstants.Password + DB_PASSWORD);
                }
                return sb.ToString();
            }
        }
    }
}

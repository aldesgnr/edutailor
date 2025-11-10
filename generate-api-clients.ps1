cd ./bd-academy-backend
dotnet swagger tofile --output api-clients\openapi.json ./bd-academy-backend/bin/Debug/net7.0/bd-academy-backend.dll "v1"
docker run --rm -v "${pwd}:/local" openapitools/openapi-generator-cli generate -i /local/api-clients/openapi.json -g typescript-axios -o /local/api-clients/typescript-axios
copy api-clients/typescript-axios/* ..\bd-academy\src\api-client\  -Recurse -Force
cd ..
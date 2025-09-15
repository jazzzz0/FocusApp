import boto3
from botocore.client import Config

# ⚠️ Reemplaza con tus datos reales
ACCOUNT_ID = ""
ACCESS_KEY = ""
SECRET_KEY = ""
BUCKET = ""

# Endpoint S3 de Cloudflare R2
endpoint_url = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"

# Cliente S3
s3 = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name="auto"
)

# Subir un archivo de prueba
print("Subiendo archivo de prueba...")
s3.put_object(Bucket=BUCKET, Key="prueba.txt", Body=b"Hola R2!")

# Listar objetos dentro de tu bucket
print("\nObjetos en el bucket:")
response = s3.list_objects_v2(Bucket=BUCKET)
for obj in response.get('Contents', []):
    print(" -", obj['Key'])

print("\n¡Todo funcionó correctamente! ✅")
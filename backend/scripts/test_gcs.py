from google.cloud import storage

BUCKET_NAME = "focusapp-uploads"


def upload_blob(bucket_name, source_file_name, destination_blob_name):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    print(f"Uploaded {source_file_name} to {destination_blob_name}")


def list_blobs(bucket_name):
    client = storage.Client()
    blobs = client.list_blobs(bucket_name)
    for b in blobs:
        print(b.name)


if __name__ == "__main__":
    upload_blob(BUCKET_NAME, "archivo_local_de_prueba.jpg", "pruebas/archivo_prueba.jpg")
    print("Objetos en el bucket:")
    list_blobs(BUCKET_NAME)

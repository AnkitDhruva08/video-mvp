import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# If modifying these scopes, delete the file token.json.
# drive.file: Allows app to access only files created or opened by it.
# drive.appdata: Allows app to access its own hidden data folder.
# drive.metadata.readonly: Allows app to read file metadata (useful for listing files).
SCOPES = ['https://www.googleapis.com/auth/drive.file'] # Access to files created by the app
TOKEN_FILE = 'token.json'
CREDENTIALS_FILE = 'credentials.json'

def get_drive_service():
    """Authenticates and returns a Google Drive service object."""
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(f"'{CREDENTIALS_FILE}' not found. Please download from Google Cloud Console.")
            
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            # This will open a browser window for manual authentication on first run
            # For a web app, you'd integrate this with a redirect URI.
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    
    return build('drive', 'v3', credentials=creds)

def upload_file_to_drive(file_path: str, file_name: str, folder_id: str = None):
    """
    Uploads a file to Google Drive.
    :param file_path: The local path to the file to upload.
    :param file_name: The name to use for the file in Google Drive.
    :param folder_id: (Optional) The ID of the folder to upload to. If None, uploads to root.
    :return: The ID of the uploaded file in Google Drive, or None if failed.
    """
    try:
        service = get_drive_service()

        file_metadata = {'name': file_name}
        if folder_id:
            file_metadata['parents'] = [folder_id]

        media = MediaFileUpload(file_path, mimetype='video/mp4', resumable=True)
        
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        print(f"File ID: {file.get('id')} uploaded to Google Drive.")
        return file.get('id')
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"An error occurred during Google Drive upload: {e}")
        return None

# --- Helper function to find a folder by name (optional but useful) ---
def find_or_create_folder(folder_name: str, service):
    """
    Finds a folder by name, or creates it if it doesn't exist.
    """
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    response = service.files().list(q=query, fields='files(id, name)').execute()
    folders = response.get('files', [])

    if folders:
        print(f"Found folder '{folder_name}' with ID: {folders[0]['id']}")
        return folders[0]['id']
    else:
        print(f"Folder '{folder_name}' not found. Creating it...")
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = service.files().create(body=file_metadata, fields='id').execute()
        print(f"Created folder '{folder_name}' with ID: {folder.get('id')}")
        return folder.get('id')
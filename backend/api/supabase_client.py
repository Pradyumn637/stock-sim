import os
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None
    print("NOTICE: Supabase SDK not installed. Storage features are disabled.")

from dotenv import load_dotenv
from pathlib import Path

# Load env in case it's called standalone
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key or not SUPABASE_AVAILABLE:
    supabase = None
else:
    supabase: Client = create_client(url, key)

def get_public_url(bucket: str, path: str):
    """
    Returns the public URL for a file in a Supabase Storage bucket.
    """
    if not supabase:
        return None
    return supabase.storage.from_(bucket).get_public_url(path)

def upload_file(bucket: str, path: str, file_content):
    """
    Uploads a file to a Supabase Storage bucket.
    """
    if not supabase:
        return None
    return supabase.storage.from_(bucket).upload(path, file_content)

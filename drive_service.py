from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive

def get_drive():
    gauth = GoogleAuth()
    gauth.settings['client_config_backend'] = 'service'
    gauth.settings['service_config'] = {
        'client_json_file_path': 'config/service_account.json',
        'client_user_email': ''
    }
    gauth.ServiceAuth()
    return GoogleDrive(gauth)
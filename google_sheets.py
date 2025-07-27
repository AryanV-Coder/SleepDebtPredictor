import gspread
from oauth2client.service_account import ServiceAccountCredentials

def save_to_google_sheet(data: dict):

    try :
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name("sleepdebtpredictor-415b8-eb05f2a06cd0.json", scope)
        client = gspread.authorize(creds)

        sheet = client.open("SleepDebtPredictor").sheet1  # or use .worksheet("Sheet1")
        
        # Check if sheet is empty by looking at first row only (more efficient)
        try:
            first_row = sheet.row_values(1)
            if not first_row:  # Empty sheet
                sheet.append_row(list(data.keys()))
        except gspread.exceptions.APIError:
            # Sheet is completely empty, add headers
            sheet.append_row(list(data.keys()))
        
        sheet.append_row(list(data.values()))

        print("✅ Data saved to google sheets")

    except FileNotFoundError:
        print("❌ ERROR: Service account JSON file not found")

    except gspread.exceptions.APIError as e:
        if "Drive API has not been used" in str(e):
            print("❌ ERROR: Google Drive API not enabled. Please enable it in Google Cloud Console")
        else:
            print(f"❌ API ERROR: {e}")

    except gspread.exceptions.SpreadsheetNotFound:
        print("❌ ERROR: Spreadsheet 'SleepDebtPredictor' not found")

    except Exception as e:
        print(f"❌ ERROR: {e}")

from app import create_app
from flask_login import current_user

app = create_app()

if __name__ == "_main_":
    app.run()

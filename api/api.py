from flask import Flask

app = Flask(__name__)

@app.route('/home')
def get_home():
    return {'text': 'This is home url'}

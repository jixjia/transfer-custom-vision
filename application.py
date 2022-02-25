from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from flask_cors import CORS
import json
import time
import logging
import urllib.request, urllib.parse, urllib.error
import requests
from utilities import config

# instantiate flask app
app = Flask(__name__)
app.secret_key = config.APP_SECRET
app.config['JWT_SECRET_KEY'] = config.JWT_SECRET
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_SIZE * 1024*1024
CORS(app)

# set logging level
logging.basicConfig(level=logging.WARNING)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/getProjects', methods=['POST'])
def getProjects():
    results = []
    
    # input data
    data = request.json
    source_resource_name = data['source_resource_name']
    source_training_key = data['source_training_key']

    # get projects (GetProjects API)
    endpoint = f'https://{source_resource_name}.cognitiveservices.azure.com/customvision/v3.3/Training/projects'
    headers = {
        'Training-key': source_training_key,
    }
    params = urllib.parse.urlencode({})

    try:
        r = requests.get(endpoint+f'?{params}', headers=headers)

        if r.status_code != 200:
            raise ValueError('GetProjects', r.status_code)
        else:
            results = r.json()

    except Exception as e:
        logging.warning(str(e.args))

    return json.dumps({
        'data': render_template('projects.html', results=results)
    })


@app.route('/importProjects', methods=['POST'])
def importProjects():
    status = 'ok'
    msg = None
    error_detail = None
    
    # input data
    data = request.json
    selected_projects = data['selected_projects']
    source_resource_name = data['source_resource_name']
    source_training_key = data['source_training_key']
    destination_resource_name = data['destination_resource_name']
    destination_training_key = data['destination_training_key']

    # parse project id and project name
    for project in selected_projects:
        id = project.split('|')[0]
        name = project.split('|')[1]

        # Generate token (ExportProject API)
        endpoint = f'https://{source_resource_name}.cognitiveservices.azure.com/customvision/v3.3/Training/projects/{id}/export'
        headers = {
            'Training-key': source_training_key,
        }
        params = urllib.parse.urlencode({})

        try:
            r = requests.get(endpoint+f'?{params}', headers=headers)
            
            if r.status_code != 200:
                raise ValueError('ExportProject', r.status_code)
            else:
                results = r.json()

                # URL encode token
                token = results['token']

        except Exception as e:
            logging.warning(str(e.args))
            msg = 'Failed to get export token. Check your ORIGIN details are correct'
            status = 'error'
            error_detail = r.text

        # Transfer (ImportProject API)
        endpoint = f'https://{destination_resource_name}.cognitiveservices.azure.com/customvision/v3.3/Training/projects/import'
        headers = {
            'Training-key': destination_training_key,
        }
        params = urllib.parse.urlencode({
            'token': token,
            'name': name
        })

        try:
            r = requests.post(endpoint+f'?{params}', headers=headers)

            if r.status_code != 200:
                raise ValueError('ImportProjects', r.status_code, r.text)
            else:
                results = r.json()

        except Exception as e:
            logging.warning(str(e.args))
            msg = f'''Transfer failed. Verify your TARGET details are correct'''
            error_detail = r.text
            status = 'error'

        logging.info(f'Successful > project_id: {id}, project_name: {name}')

    return jsonify({'status': status, 'msg': msg, 'error_detail': error_detail})


if __name__ == '__main__':
    app.run(debug=True)

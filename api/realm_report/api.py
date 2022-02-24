import os
import pickle
from collections import deque
from importlib.resources import path
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from tensorboard import program

import realm_report.data
from realm_report.functions import *
from realm_report.generator import (createHeatmap1, createHeatmap2,
                                    createHeatmap3, createHeatmap4, createHeatmap5)

app = Flask(__name__)
CORS(app)

#  -------- Global --------

# keeps track of the json files that are loaded into memory
DATA_JSON_LOOKUP = set() 

# data dictionary - {key = file name, value = json data loaded in memory}
DATA_DICTIONARY = {}

# keeps track of launched tensorboard instances
tb_instances = {}

#  -------- Constants --------

# data location (hardcoded for now, would like user to be able to change this value)
TEST_DATA_DIRECTORY = "data"

# heatmap result location (hardcoded for now, would like user to be able to change this value)
HEATMAP_RESULTS_DIRECTORY = "analysis/heatmaps/"

DATA_SUBDIRECTORY = "/RealmAI/Data"

VIDEOS_SUBDIRECTORY = "/RealmAI/Videos"

#  -------- Routes --------

@app.route('/home')
def get_home():
    return {'text': 'This is home url'}

# you can change this michael - just for testing 
@app.route('/allFiles')
def get_all_files():
    with path(realm_report, TEST_DATA_DIRECTORY) as f:
        allFiles = getAllFilesFromDirectory(f)
    return jsonify(allFiles)

# you can change this michael - just for testing 
@app.route('/datFiles')
def get_dat_files():
    with path(realm_report, TEST_DATA_DIRECTORY) as f:
        datFiles = getAllDatFilesFromDirectory(f)
    return jsonify(datFiles)

# you can change this michael - just for testing 
@app.route('/jsonFiles')
def get_json_files():
    with path(realm_report, TEST_DATA_DIRECTORY) as f:
        jsonFiles = getAllJsonFilesFromDirectory(f)
    return jsonify(jsonFiles)

def _cache_recent_directories(directory, remove_only=False):
    with path(realm_report, TEST_DATA_DIRECTORY) as d:
        f = os.path.join(d, "recent_dir.pkl")
        if not os.path.isfile(f):
            if remove_only: 
                return
            else: 
                recent_dir = []
        else:
            recent_dir = pickle.load(open(f, "rb"))
        if directory in recent_dir:
            recent_dir.remove(directory)
        if not remove_only:
            recent_dir.append(directory)
        pickle.dump(recent_dir[-25:], open(f, "wb"))

@app.route('/isValidDirectory', methods=["POST"])
def is_valid_directory():
    error_message = ""
    is_valid_run_dir = True
    filepath = request.json["file_path"]
    if not os.path.isdir(filepath):
        error_message = "path is not a valid directory"
        is_valid_run_dir = False
    # check the internal directory structure
    elif not checkRunDirectoryStructure(filepath):
        error_message = "path is not a valid runs directory with proper structure"
        is_valid_run_dir = False
    _cache_recent_directories(filepath, remove_only= not is_valid_run_dir)
    return jsonify({"isDirectory": is_valid_run_dir, "error": error_message})

@app.route('/recentDirectories', methods=["GET", "POST"])
def get_recent_directories():
    with path(realm_report, TEST_DATA_DIRECTORY) as d:
        f = os.path.join(d, "recent_dir.pkl")
        if not os.path.isfile(f):
            return jsonify({"recent_directories":[]})
        else:
            recent_dir = pickle.load(open(f, "rb"))[::-1]
            return jsonify({"recent_directories":recent_dir})

@app.route('/clearRecentDirectories', methods=["POST"])
def clear_recent_directories():
    with path(realm_report, TEST_DATA_DIRECTORY) as d:
        f = os.path.join(d, "recent_dir.pkl")
        if os.path.isfile(f):
            os.remove(f)
    return 'done'

@app.route('/launchTensorboard', methods=["POST"])
def launch_tensorboard():
    fp = request.json["file_path"]
    assert os.path.isdir(fp), "{} does not exist!".format(fp)
    if fp not in tb_instances:
        tb = program.TensorBoard()
        tb.configure(argv=[None, "--logdir", request.json["file_path"]])
        tb_instances[fp] = tb.launch()
    return jsonify({"localHost": tb_instances[fp]})

@app.route('/getAllVideos', methods=["POST"])
def get_all_videos():
    return {"fullPaths": getAllVideoFilesFromDirectory(request.json["file_path"]+VIDEOS_SUBDIRECTORY, True), "fileNames":  getAllVideoFilesFromDirectory(request.json["file_path"]+VIDEOS_SUBDIRECTORY, False)}

@app.route('/getAllHeatmaps', methods=["POST"])
def get_all_heatmaps():
    # get all heatmap images that exist in current file_path from request body
    return jsonify(getAllHeatmapFilesFromDirectory(request.json["file_path"]+DATA_SUBDIRECTORY))

@app.route('/deleteHeatmap', methods=["POST"])
def delete_heatmap():
    # delete the selected heatmap
    deleteFile(request.json["file_path"]+DATA_SUBDIRECTORY, request.json["file_name"])
    return jsonify(success=True)

@app.route('/playVideo', methods=["POST"])
def play_video():
    if playVideo(request.json["file_path"]):
        return ('', 200)
    else:
        return ('', 400)

# ROUTES BELOW ARE FROM REPORTING SUBSYSTEM DOCUMENTATION

@app.route('/count_dat_files')
def count_dat_files():
    return {"count": len(getAllDatFilesFromDirectory(request.json["file_path"]+DATA_SUBDIRECTORY))}

@app.route('/by_reward/<range_type>/<percentage>', methods=["POST"])
def create_heatmap_by_reward(range_type, percentage):
    '''
    TODO validate parameter inputs
    '''
    highest = None
    if range_type == "top":
        highest = True
    elif range_type == "bottom":
        highest = False

    absDataDirPath = Path(request.json["file_path"] + DATA_SUBDIRECTORY)
    fileName = f"heatmap_reward_{range_type}_{percentage}.jpg"
    fileSavePath = absDataDirPath / fileName

    datFilePaths = getAllDatFilesFromDirectory(absDataDirPath)
    err, data = loadJSONIntoMemory(datFilePaths)
    if err is not None:
        return {'name': fileName, 'error': getErrorGeneric(err) }
    createHeatmap2(data, float(percentage), highest, fileSavePath)

    base64_str = getAndConvertJPGToBase64(fileSavePath)
    created_at = getCreatedAtTime(fileSavePath)
    return {'name': fileName, "base64": base64_str, "created_at": created_at}

@app.route('/by_episode_length/<range_type>/<percentage>', methods=["POST"])
def create_heatmap_by_episode_length(range_type, percentage):
    '''
    TODO validate parameter inputs
    '''
    highest = None
    if range_type == "top":
        highest = True
    elif range_type == "bottom":
        highest = False
    
    absDataDirPath = Path(request.json["file_path"] + DATA_SUBDIRECTORY)
    fileName = f"heatmap_episode_length_{range_type}_{percentage}.jpg"
    fileSavePath = absDataDirPath / fileName

    datFilePaths = getAllDatFilesFromDirectory(absDataDirPath)
    err, data = loadJSONIntoMemory(datFilePaths)
    if err is not None:
        return {'name': fileName, 'error': getErrorGeneric(err) }
    createHeatmap3(data, float(percentage), highest, fileSavePath)

    base64_str = getAndConvertJPGToBase64(fileSavePath)
    created_at = getCreatedAtTime(fileSavePath)
    return {'name': fileName, "base64": base64_str, "created_at": created_at}

@app.route('/by_episode_num/<lower_bound>/<upper_bound>', methods=["POST"])
def create_heatmap_by_episodes(lower_bound, upper_bound):
    '''
    TODO validate parameter inputs
    '''
    
    absDataDirPath = Path(request.json["file_path"] + DATA_SUBDIRECTORY)
    fileName = f"heatmap_episode_num_{lower_bound}_to_{upper_bound}.jpg"
    fileSavePath = absDataDirPath / fileName

    datFilePaths = getAllDatFilesFromDirectory(absDataDirPath)
    err, data = loadJSONIntoMemory(datFilePaths)
    if err is not None:
        return {'name': fileName, 'error': getErrorGeneric(err) }
    createHeatmap5(data, float(lower_bound), float(upper_bound), fileSavePath)

    base64_str = getAndConvertJPGToBase64(fileSavePath)
    created_at = getCreatedAtTime(fileSavePath)
    return {'name': fileName, "base64": base64_str, "created_at": created_at}

@app.route('/naive', methods=["POST"])
def create_heatmap_naive():
    '''
    TODO validate parameter inputs
    '''

    absDataDirPath = Path(request.json["file_path"] + DATA_SUBDIRECTORY)
    fileName = "heatmap_naive.jpg"
    fileSavePath = absDataDirPath / fileName

    datFilePaths = getAllDatFilesFromDirectory(absDataDirPath)
    err, data = loadJSONIntoMemory(datFilePaths)
    if err is not None:
        return {'name': fileName, 'error': getErrorGeneric(err) }
    createHeatmap1(data, fileSavePath)

    base64_str = getAndConvertJPGToBase64(fileSavePath)
    created_at = getCreatedAtTime(fileSavePath)
    return {'name': fileName, "base64": base64_str, "created_at": created_at}

@app.route('/by_last_position', methods=["POST"])
def create_heatmap_by_last_position():
    '''
    TODO validate parameter inputs
    '''
    absDataDirPath = Path(request.json["file_path"] + DATA_SUBDIRECTORY)
    fileName = "heatmap_last_position.jpg"
    fileSavePath = absDataDirPath / fileName

    datFilePaths = getAllDatFilesFromDirectory(absDataDirPath)
    err, data = loadJSONIntoMemory(datFilePaths)
    if err is not None:
        return {'name': fileName, 'error': getErrorGeneric(err) }
    createHeatmap4(data, fileSavePath)

    base64_str = getAndConvertJPGToBase64(fileSavePath)
    created_at = getCreatedAtTime(fileSavePath)
    return {'name': fileName, "base64": base64_str, "created_at": created_at}

# @app.before_first_request # couldn't get this to be on flask init
# def init():
#     # On Flask Server Start Up
#     allDatFiles = set(getAllDatFilesFromDirectory(DATA_DIRECTORY))
#     allJsonFiles = set(getAllJsonFilesFromDirectory(DATA_DIRECTORY))
#     datFilesThatNeedToBeConverted = set()
#     jsonFilesThatShouldBeLoadedIntoMemory = set()
    
#     # case 1: dat file found, corresponding json file found -> do nothing
#     # case 2: dat file found, no json file found -> convertDatToJson
#     for datFile in allDatFiles:
#         correspondingJsonFile = datFile.replace(".dat", ".json")
        
#         if correspondingJsonFile not in allJsonFiles: # case 2
#             datFilesThatNeedToBeConverted.add(datFile)

#         jsonFilesThatShouldBeLoadedIntoMemory.add(correspondingJsonFile)

#     # convert all dat files that don't have a corresponding json file
#     for datFile in datFilesThatNeedToBeConverted:
#         convertDatToJson(datFile, datFile.replace(".dat", ".json"))

#     # load all json files to memory
#     for jsonFile in jsonFilesThatShouldBeLoadedIntoMemory:
#         DATA_DICTIONARY[jsonFile] = loadJSONIntoMemory(jsonFile)
#         DATA_JSON_LOOKUP.add(jsonFile)

#     print("These JSON files have been loaded into memory:")
#     print(DATA_JSON_LOOKUP)


def main():
    app.run(host='0.0.0.0', debug=True)

if __name__=='__main__':
    main()

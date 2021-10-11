from flask import Flask, jsonify
from analysis.functions import *
from analysis.generator import *

app = Flask(__name__)

# keeps track of the json files that are loaded into memory
DATA_JSON_LOOKUP = set() 

# data dictionary - {key = file name, value = json data loaded in memory}
DATA_DICTIONARY = {}

# data location (hardcoded for now, would like user to be able to change this value)
DATA_DIRECTORY = "analysis/data"

# heatmap result location (hardcoded for now, would like user to be able to change this value)
HEATMAP_RESULTS_DIRECTORY = "analysis/heatmaps/"


@app.route('/home')
def get_home():
    return {'text': 'This is home url'}

# you can change this michael - just for testing 
@app.route('/allFiles')
def get_all_files():
    allFiles = getAllFilesFromDirectory("analysis/data")
    return jsonify(allFiles)

# you can change this michael - just for testing 
@app.route('/datFiles')
def get_dat_files():
    datFiles = getAllDatFilesFromDirectory("analysis/data")
    return jsonify(datFiles)

# you can change this michael - just for testing 
@app.route('/jsonFiles')
def get_json_files():
    jsonFiles = getAllJsonFilesFromDirectory("analysis/data")
    return jsonify(jsonFiles)

# you can change this michael - just for testing 
@app.route('/create/heatmap/1')
def create_heatmap_1():
    # hardcoded file for testing purposes - michael, you should look into accepting filePath as a param
    filePath = "analysis/data/Data-1.json"

    # hardcoded file name for testing purposes
    # should discuss a file naming convention, or allow user to input file name
    fileName = "heatmap1.jpg"

    if filePath not in DATA_JSON_LOOKUP: # data needs to be loaded in
        data = loadJSONIntoMemory(filePath)
        if data == []:
            return {'text': 'Heatmap 1 was not created: %s' % filePath}

        DATA_DICTIONARY[filePath] = data
        DATA_JSON_LOOKUP.add(filePath)
        print("%s has been loaded into memory successfully" % filePath)
        
    # Get data
    data = DATA_DICTIONARY[filePath]
    fileSavePath = HEATMAP_RESULTS_DIRECTORY + fileName

    # Create Heatmap
    createHeatmap1(data, fileSavePath)
    
    return {'text': 'Heatmap 1 created: %s' % fileSavePath}

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
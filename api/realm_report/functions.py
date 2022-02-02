import base64
import json
import os
import platform
import re
import struct
import time
import subprocess, shlex
from pathlib import Path

# gets the created at date given a absolute filepath
def getCreatedAtTime(filePath):
    return time.ctime(os.path.getctime(filePath))

# gets and converts a jpg to base 64, pass absoulte path as argument
def getAndConvertJPGToBase64(filePath):
    with open(filePath, "rb") as img_file:
        base64_str = base64.b64encode(img_file.read()).decode("utf-8")
    return base64_str

# returns dictionary of json data from the dat file
def convertDatToJson(datFilePaths):
    jsondict = {'episodes':[]}
    for path in datFilePaths:
        file = open(path, "rb")
        jsondict = {'episodes':[]}
        bytes = file.read(16)
        while bytes:
            # Read from .dat file
            (episode, duration, reward, num_positions) = struct.unpack("iffi", bytes)
            # print("Episode: %d, duration: %f, reward: %f, positions: %d" % (episode, duration, reward, num_positions))
            positions = []
            for i in range(num_positions):
                bytes = file.read(8)
                (x, y) = struct.unpack("ff", bytes)
                positions.append((x,y))
            bytes = file.read(16)

            # Write to json
            pos_x, pos_y = zip(*positions)
            episode_data = {
                'episode_number':episode, 
                'duration':duration, 
                'reward':reward, 
                'pos_x': pos_x,
                'pos_y': pos_y,
                'step_num':num_positions # not in spec, but could be useful
                }
            jsondict['episodes'].append(episode_data)

        file.close()
        
    return jsondict

# converts dat to json as dictionary
def loadJSONIntoMemory(filePaths):
    try: 
        return convertDatToJson(filePaths)
    except OSError as e:
        print("Error: %s : %s" % (filePaths, e.strerror))
        return []

def removeFile(filePath):
    try:
        os.remove(filePath)
        print("File sucessfully deleted")
    except OSError as e:
        print("Error: %s : %s" % (filePath, e.strerror))

# Please specify the full directory for both parameters
def renameFile(existingFilePath, newFileName):
    try:
        os.rename(existingFilePath, newFileName)
        print("File sucessfully renamed to %s" % newFileName)
    except OSError as e:
        print("Error: %s : %s" % (existingFilePath, e.strerror))

def mergeFiles(filesToMerge, endFile):  
    with open(endFile, 'w') as outfile:
        for file in filesToMerge:
            with open(file) as infile:
                outfile.write(infile.read())
            outfile.write("\n")

def getAllFilesFromDirectory(directory):
    try:
        allFiles = []
        for file in os.listdir(directory):
            allFiles.append(os.path.join(directory, file))

        # Sort by file number
        allFiles.sort(key=lambda f: int(re.sub('\D', '', f)))

        return allFiles

    except OSError as e:
        print("Error: %s : %s" % (directory, e.strerror))
        return []

def getAllDatFilesFromDirectory(directory):
    try:
        allDatFiles = []
        for file in os.listdir(directory):
            if file.endswith(".dat"):
                allDatFiles.append(os.path.join(directory, file))

        # Sort by file number
        allDatFiles.sort(key=lambda f: int(re.sub('\D', '', f)))

        return allDatFiles

    except OSError as e:
        print("Error: %s : %s" % (directory, e.strerror))
        return []

def getAllJsonFilesFromDirectory(directory):
    try:
        allJsonFiles = []
        for file in os.listdir(directory):
            if file.endswith(".json"):
                allJsonFiles.append(os.path.join(directory, file))

        # Sort by file number
        allJsonFiles.sort(key=lambda f: int(re.sub('\D', '', f)))

        return allJsonFiles

    except OSError as e:
        print("Error: %s : %s" % (directory, e.strerror))
        return []
        
def getAllVideoFilesFromDirectory(directory, fullPath):
    try:
        allVideoFiles = []
        for file in os.listdir(directory):
            if file.endswith(".mp4") or file.endswith(".webm"):
                if fullPath:
                    allVideoFiles.append(os.path.join(directory, file))
                else:
                    allVideoFiles.append(file)

        # Sort by file number
        allVideoFiles.sort(key=lambda f: int(re.sub('\D', '', f)))

        return allVideoFiles

    except OSError as e:
        print("Error: %s : %s" % (directory, e.strerror))
        return []

def playVideo(filePath):
    userOS = platform.system() # Possible outputs: Windows, Linux, Darwin (macOS), Java

    # os not detected
    if userOS == "": 
        return False

    if userOS == "Windows":
        cmd = '"%s"' % filePath
        subprocess.run(shlex.split(cmd))

    elif userOS == "Linux":
        cmd = 'xdg-open "%s"' % filePath
        subprocess.run(shlex.split(cmd))

    elif userOS == "Darwin":
        cmd = 'open "%s"' % filePath
        subprocess.run(shlex.split(cmd))
        
    return True

def getAllHeatmapFilesFromDirectory(directory):
    heatmap_types = ["naive", "reward", "episode_length", "last_position"]
    try:
        allHeatmapFiles = {"naive": [], "reward": [], "episode_length": [], "last_position": []}
        for file in os.listdir(directory):
            if file.endswith(".jpg"):
                # for given heatmap, find out which type of heatmap it is
                for heatmap_type in heatmap_types:
                    if heatmap_type in file:
                        abs_file_path = Path(directory) / file
                        allHeatmapFiles[heatmap_type].append({"name": file, "base64": getAndConvertJPGToBase64(abs_file_path), "created_at": getCreatedAtTime(abs_file_path) })

        # Sort each list by dat_id?
        return allHeatmapFiles

    except OSError as e:
        print("Error: %s : %s" % (directory, e.strerror))
        return []

def checkFileExists(fileName, directory):
    if fileName in os.listdir(directory):
        return True
    return False

def deleteFileIfExists(fileName, directory):
    if not checkFileExists(fileName, directory):
        return False
    os.remove(Path(directory, fileName))
    return True

def checkRunDirectoryStructure(directory):
    # run directories should follow a consistent internal structure
    # these are the things we check for, RealmAI/Data, RealmAI/Videos. The tenserboard data should be in a seperate subdirectory from RealmAI
    data_dir_exists = False
    video_dir_exists = False
    for file_parent in os.listdir(directory):
        if file_parent == "RealmAI":
            for file_child in os.listdir(directory+"/RealmAI"):
                if file_child == "Data":
                    data_dir_exists = True
                if file_child == "Videos":
                    video_dir_exists = True
    return data_dir_exists and video_dir_exists

def constructDatFileName(dat_id):
    return f"data-{dat_id}.dat"

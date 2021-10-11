import json
import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

xSize = 43
ySize = 193

def createHeatmap1(data, filePath):
    print("Heatmap 1: Naive heatmap")

    # Concatenate all positional data across episodes
    pos_x, pos_y = [], []
    for eps in data['episodes']:
        pos_x.append(eps['pos_x'])
        pos_y.append(eps['pos_y'])

    # Bin values
    pos_x, pos_y = np.concatenate(pos_x), np.concatenate(pos_y)
    H, _, _ = np.histogram2d(pos_x, pos_y, bins=[xSize, ySize])
    
    # Plot heatmap and save figures
    sns.heatmap(np.log(H.T+1), cmap="BuPu", yticklabels=20)
    plt.savefig(filePath)
    plt.close()
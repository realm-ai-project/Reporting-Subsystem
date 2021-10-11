import json
import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

xSize = 43
ySize = 193

"""
    createHeatmap1 - creates naive heatmap

    data (dictionary): heatmap data
    filePath (string): path to save heatmap
""" 
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


"""
    createHeatmap2 - creates heatmap based on percentage highest/lowest gamescore

    data (dictionary): heatmap data
    percentile (decimal): percentage of highest/lowest gamescore to filter by
    highest (boolean): True = filter by top percentile, False = filter by bottom percentile
    filePath (string): path to save heatmap
"""
def createHeatmap2(data, percentile, highest, filePath):
    assert 0 < percentile <= 1
    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # Sort episodes by highest/lowest gamescore (i.e., reward)    
    sorted_df = df.sort_values(by=['reward'], ascending=not highest)

    # Filter by percentile
    filtered_df = sorted_df.iloc[:int(len(sorted_df)*percentile), :]

    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

    # Bin values
    H, _, _ = np.histogram2d(pos_x, pos_y, bins=[xSize, ySize])

    # Plot heatmap and save figures
    sns.heatmap(np.log(H.T+1), yticklabels=20)

    if highest:
        print("Heatmap 2: Top %f%% highest gamescore episodes" % (percentile*100))
        plt.savefig(filePath)
    else:
        print("Heatmap 2: Bottom %f%% lowest gamescore episodes" % (percentile*100))
        plt.savefig(filePath)

    plt.close()
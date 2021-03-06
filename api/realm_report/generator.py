import json
import os
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

matplotlib.use('agg')

def plot_and_save(pos_x, pos_y, filePath, x_max, y_max, x_min, y_min):
    pos_x = np.append(pos_x, [x_min, x_max, x_min, x_max], axis=0)
    pos_y = np.append(pos_y, [y_min, y_min, y_max, y_max], axis=0)
    x_size, y_size = abs(int(x_max - x_min)), abs(int(y_max - y_min))
    
    # Add space for axis labels and cbar
    x_size += 50

    # Find greatest common divisor 
    # gcd = np.gcd(x_size, y_size)
    
    # Set aspect ratio of figure
    aspect_ratio = x_size/y_size
    
    # max_width, max_height = 6.4, 4.8 # default figsize of matplotlib, in inches
    max_width, max_height = 8, 6 # our own max size in inches
    if max_width/aspect_ratio>max_height:
        height = max_height
        width = aspect_ratio*height
        assert width<=max_width
    else:
        width = max_width
        height = width/aspect_ratio
        assert height<=max_height

    plt.figure(figsize=(width, height))
    H, _, _ = np.histogram2d(pos_x, pos_y, bins=[x_size, y_size])
    
    # Plot heatmap and save figures
    ax = sns.heatmap(np.log(H.T+1), cmap="BuPu",)# cbar=False, xticklabels=False, yticklabels=False)
    # flip axis to match Unity
    ax.invert_yaxis()
    # stop tick labels from being cut off
    ax.figure.tight_layout()

    # We can overwrite files this way
    plt.savefig(filePath)
    plt.close()

def overlay_game_image(ax, x_size, y_size, imagefile='zombiemap.png'):
    # get the image as an array so we can plot it 
    import matplotlib.image as mpimg 
    map_img = mpimg.imread(imagefile) 
    # map_img = np.rot90(map_img, 2) # rotate image by 90 deg
    # map_img = np.fliplr(map_img) # flip image horizontally

    ax.imshow(map_img,
          aspect = ax.get_aspect(),
          origin = 'lower',
          extent = (0, x_size, y_size+4, 0),
          zorder = 1) #put the map under the heatmap

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
    plot_and_save(pos_x, pos_y, filePath, max(pos_x), max(pos_y), min(pos_x), min(pos_y))


# """
#     createHeatmap2 - creates heatmap based on percentage highest/lowest gamescore

#     data (dictionary): heatmap data
#     percentile (decimal): percentage of highest/lowest gamescore to filter by
#     highest (boolean): True = filter by top percentile, False = filter by bottom percentile
#     filePath (string): path to save heatmap
# """
# def createHeatmap2(data, percentile, highest, filePath):
#     assert 0 < percentile <= 1
    
#     # Convert data into dataframe
#     df = pd.DataFrame.from_dict(data['episodes'])
#     df.head()

#     # Sort episodes by highest/lowest gamescore (i.e., reward)    
#     sorted_df = df.sort_values(by=['reward'], ascending=not highest)

#     # get the x_size and y_size for aspect ratio and number of bins
#     unfiltered_pos_x, unfiltered_pos_y = np.concatenate(sorted_df['pos_x'].to_numpy()), np.concatenate(sorted_df['pos_y'].to_numpy())

#     # Filter by percentile
#     filtered_df = sorted_df.iloc[:int(len(sorted_df)*percentile), :]

#     # Concatenate all positional data across filtered episodes
#     pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

#     if highest:
#         print("Heatmap 2: Top %f%% highest gamescore episodes" % (percentile*100))
#     else:
#         print("Heatmap 2: Bottom %f%% lowest gamescore episodes" % (percentile*100))
#     plot_and_save(pos_x, pos_y, filePath, max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))

"""
    createHeatmap2 - creates heatmap based on percentage range of heatmap rewards

    data (dictionary): heatmap data
    lower_bound (decimal): lower bound percentage of reward
    upper_bound (decimal): upper bound percentage of of reward
    filePath (string): path to save heatmap
"""
def createHeatmap2(data, lower_bound, upper_bound, filePath):    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # Sort episodes by reward in ascending order
    sorted_df = df.sort_values(by=['reward'], ascending=True)

    # get the x_size and y_size for aspect ratio and number of bins
    unfiltered_pos_x, unfiltered_pos_y = np.concatenate(sorted_df['pos_x'].to_numpy()), np.concatenate(sorted_df['pos_y'].to_numpy())

    # Filter by percentile
    # filtered_df = sorted_df.iloc[:int(len(sorted_df)*percentile), :]
    filtered_df = sorted_df.iloc[int(len(sorted_df)*lower_bound):int(len(sorted_df)*upper_bound), :]

    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

    print(f"Heatmap 2: {lower_bound}% to {upper_bound}% relative range episodes by reward")
    plot_and_save(pos_x, pos_y, filePath, max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))


# """
#     createHeatmap3 - creates heatmap based on percentage longest/shortest duration

#     data (dictionary): heatmap data
#     percentile (decimal): percentage of highest/lowest gamescore to filter by
#     longest (boolean): True = filter by top percentile, False = filter by bottom percentile
#     filePath (string): path to save heatmap
# """
# def createHeatmap3(data, percentile, longest, filePath):
#     assert 0 < percentile <= 1
    
#     # Convert data into dataframe
#     df = pd.DataFrame.from_dict(data['episodes'])
#     df.head()

#     # Get percentile episodes that are longest/shortest  
#     sorted_df = df.sort_values(by=['step_num'], ascending=not longest)

#     # get the x_size and y_size for aspect ratio and number of bins
#     unfiltered_pos_x, unfiltered_pos_y = np.concatenate(sorted_df['pos_x'].to_numpy()), np.concatenate(sorted_df['pos_y'].to_numpy())
#     x_size, y_size = int(max(unfiltered_pos_x) - min(unfiltered_pos_x)), int(max(unfiltered_pos_y) - min(unfiltered_pos_y))

#     # Filter by percentile
#     filtered_df = sorted_df.iloc[:int(len(sorted_df)*percentile), :]

#     # Concatenate all positional data across filtered episodes
#     pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

#     if longest:
#         print("Heatmap 3: Top %f%% longest duration episodes" % (percentile*100))
#     else:
#         print("Heatmap 3: Top %f%% shortest duration episodes" % (percentile*100))
#     plot_and_save(pos_x, pos_y, filePath,  max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))

"""
    createHeatmap3 - creates heatmap based on percentage range of episode lengths

    data (dictionary): heatmap data
    lower_bound (decimal): lower bound percentage of episode lengths
    upper_bound (decimal): upper bound percentage of of episode lengths
    filePath (string): path to save heatmap
"""
def createHeatmap3(data, lower_bound, upper_bound, filePath):    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # Sort all episodes by increasing step_num, should be similar to using duration, since steps are at periodic intervals
    sorted_df = df.sort_values(by=['step_num'], ascending=True)

    # get the x_size and y_size for aspect ratio and number of bins
    unfiltered_pos_x, unfiltered_pos_y = np.concatenate(sorted_df['pos_x'].to_numpy()), np.concatenate(sorted_df['pos_y'].to_numpy())
    x_size, y_size = int(max(unfiltered_pos_x) - min(unfiltered_pos_x)), int(max(unfiltered_pos_y) - min(unfiltered_pos_y))

    # Filter by percentile
    # filtered_df = sorted_df.iloc[:int(len(sorted_df)*percentile), :]
    filtered_df = sorted_df.iloc[int(len(sorted_df)*lower_bound):int(len(sorted_df)*upper_bound), :]

    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

    print(f"Heatmap 3: {lower_bound}% to {upper_bound}% relative range episodes by episode length")
    plot_and_save(pos_x, pos_y, filePath,  max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))


"""
    createHeatmap4 - creates last position heatmap

    data (dictionary): heatmap data
    filePath (string): path to save heatmap
""" 
def createHeatmap4(data, filePath):
    print("Heatmap 4: Last position of every episode")
    
    # Get last position of every episode
    pos_x, pos_y = [], []
    for eps in data['episodes']:
        pos_x.append(eps['pos_x'][-1])
        pos_y.append(eps['pos_y'][-1])
    pos_x, pos_y = np.array(pos_x), np.array(pos_y)

    plot_and_save(pos_x, pos_y, filePath,  max(pos_x), max(pos_y), min(pos_x), min(pos_y))

"""
    createHeatmap5 - creates heatmap based on percentage of top or bottom episode numbers

    data (dictionary): heatmap data
    lower_bound (decimal): lower bound percentage of relative episodes numbers to filter by
    upper_bound (decimal): upper bound percentage of relative episodes numbers to filter by
    filePath (string): path to save heatmap
"""
def createHeatmap5(data, lower_bound, upper_bound, filePath):
    assert 0 <= lower_bound < 1
    assert 0 < upper_bound <= 1
    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # sort episodes in ascending order
    sorted_df = df.sort_values(by=['episode_number'], ascending=True)

    # get the x_size and y_size for aspect ratio and number of bins
    unfiltered_pos_x, unfiltered_pos_y = np.concatenate(sorted_df['pos_x'].to_numpy()), np.concatenate(sorted_df['pos_y'].to_numpy())

    # Filter by percentile
    filtered_df = sorted_df.iloc[int(len(sorted_df)*lower_bound):int(len(sorted_df)*upper_bound), :]

    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

    print(f"Heatmap 5: {lower_bound}% to {upper_bound}% relative range episodes by episode number")
    plot_and_save(pos_x, pos_y, filePath, max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))


"""
    createHeatmap5 - can specify a minimum reward they want

    data (dictionary): heatmap data
    minReward (float): minimum reward
    filePath (string): path to save heatmap
""" 
def createHeatmap6(data, minReward, filePath):
    print("Heatmap 5: User can specify a specific minimum reward they want")
    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # Get episodes that have at least the minimum reward
    filtered_df = df[ df['reward'] > minReward]
    filtered_df.head()

    # If there are no results return early
    if len(filtered_df) <= 1:
        print("There are no results")
        return


    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())

    unfiltered_pos_x, unfiltered_pos_y = np.concatenate(df['pos_x'].to_numpy()), np.concatenate(df['pos_y'].to_numpy())
    plot_and_save(pos_x, pos_y, filePath, max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))


"""
    createHeatmap6 - can specify a minimum step count they want

    data (dictionary): heatmap data
    minSteps (int): minimum steps
    filePath (string): path to save heatmap
""" 
def createHeatmap7(data, minSteps, filePath):
    print("Heatmap 6: User can specify a specific minimum number of steps they want")
    
    # Convert data into dataframe
    df = pd.DataFrame.from_dict(data['episodes'])
    df.head()

    # Get episodes that have at least the minimum reward
    filtered_df = df[ df['step_num'] > minSteps ]
    filtered_df.head()

    # If there are no results return early
    if len(filtered_df) <= 1:
        print("There are no results")
        return

    # Concatenate all positional data across filtered episodes
    pos_x, pos_y = np.concatenate(filtered_df['pos_x'].to_numpy()), np.concatenate(filtered_df['pos_y'].to_numpy())
   
    unfiltered_pos_x, unfiltered_pos_y = np.concatenate(df['pos_x'].to_numpy()), np.concatenate(df['pos_y'].to_numpy())
    plot_and_save(pos_x, pos_y, filePath, max(unfiltered_pos_x), max(unfiltered_pos_y), min(unfiltered_pos_x), min(unfiltered_pos_y))

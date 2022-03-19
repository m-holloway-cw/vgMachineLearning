import pyfpgrowth
import numpy as np
import csv
import pandas as pd
import json
import sys



gameData = pd.read_csv('./python/vgsales.csv', sep=',', dtype=None)

arr = gameData.to_numpy()

limit = sys.argv[1] #i.e. 500 for top 500 games

itemList = []
platformList = []
genreList = []

for item in arr:
    #this is for items only within the limit range
    if(item[0] < int(limit) ): #item[0] is rank #
        itemList.append([item[2],item[4]]) #item[2] is platform, 4 is genre
        if(item[2] not in platformList):
            platformList.append(item[2])
        if(item[4] not in genreList):
            genreList.append(item[4])


#iterate items in this limited list for counts
genreCountDict = {}
platformCountDict = {}
for item in itemList:
    if(item[0] in platformCountDict):
        platformCountDict[item[0]] += 1
    else:
        platformCountDict[item[0]] = 1
    if(item[1] in genreCountDict):
        genreCountDict[item[1]] += 1
    else:
        genreCountDict[item[1]] = 1



#make sure the item is ordered at [Platform, Genre]
#pyfpgrowth algorithm neglects order
def correctOrder(item):
    itemOut = item
    if(item[0] not in platformList):
        itemOut = [item[1], item[0]]
        return itemOut
    else:
        return itemOut



patternHigh = pyfpgrowth.find_frequent_patterns(itemList, 2)
itemListCleaned = []

for item in patternHigh.keys():
    if(len(item)>1):
        itemOrdered = correctOrder(item)
        itemListCleaned.append([itemOrdered, patternHigh.get(item)])

#a count of each genre + platform combination in the query limit using fpgrowth algorithm
genrePlatCountsSorted = sorted(itemListCleaned,key=lambda g: g[1], reverse=True) #may not need to assign - sorts in place on same variable

#find combinations of genres within platforms i.e. # of sports games on the wii
#take item list and combine
#for item in itemList:
psDict = {}


for platform in platformList:

    newFrame = gameData.copy().query('Platform == "%s"' % platform).query('Rank < ' + limit)
    psDict[platform] = dict(newFrame['Genre'].value_counts())



finalOutput = {}
finalOutput['genrePlatCounts'] = list(genrePlatCountsSorted)[:10]
finalOutput['genreCounts'] = genreCountDict
finalOutput['platformStackCounts'] = psDict

#encoding class to convert data to integers, non-integer causes read issues on frontend
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)



print(json.dumps(finalOutput, cls=NpEncoder)) #print to allow server to read

print('DONE') #flag for node to grab data and exit

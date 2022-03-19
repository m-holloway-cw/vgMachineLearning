import pyfpgrowth
import numpy
import csv
import pandas as pd
import json


gameData = pd.read_csv('./python/vgsales.csv', sep=',', dtype=None, usecols=['Rank','Name','Platform','Genre','NA_Sales','EU_Sales','JP_Sales','Other_Sales','Global_Sales'])

arr = gameData.to_numpy()

#start with genre - get all dynamically
genreList = []
gDict = {}
rDict = {}
for item in arr:
    if(item[3] not in genreList):
        genreList.append(item[3])
        gDict[item[3]] = []
        rDict[item[3]] = []


#sort games by genre
platformList = []
for game in arr:
    gDict[game[3]].append([game[1],game[2],game[8]])
    rDict[game[3]].append([game[1],game[2],game[4],game[5],game[6],game[7],game[8]])
    if(game[2] not in platformList):
        platformList.append(game[2])


finalDict = {}

#get sales for each platform within each genre
for genre in gDict:
    tDict = {}
    for game in gDict[genre]:

        for plat in platformList:
            if(plat == game[1]):

                if(plat in tDict):
                    tDict[plat] += game[2]
                    break
                else:
                    tDict[plat] = game[2]
                    break
    if(genre in finalDict):
        finalDict[genre].append(tDict)
    else:
        finalDict[genre] = tDict


#sort each final genre and platform by sales
for f in finalDict:
    finalDict[f] = sorted(finalDict[f].items(),key=lambda x:x[1],reverse=False)


#uncomment to save to file for manual reading
#save this dictionary to a csv file
#with open('./python/genres.csv', 'w') as f:
    #for key in finalDict.keys():
    #    f.write("%s,%s\n"%(key,finalDict[key]))

#with open('./python/genres.json', 'w') as fp:
#    json.dump(finalDict, fp)



#top 10 selling genres and platform in each major region
regionalDict = {}
NA = {}
EU = {}
JP = {}

for genre in rDict:
    NADict = {}
    EUDict = {}
    JPDict = {}
    for game in rDict[genre]:
        for plat in platformList:
            if(plat == game[1]):
                if(plat in NADict):
                    NADict[genre+':'+plat] += game[2]
                else:
                    NADict[genre+':'+plat] = game[2]
                if(plat in EUDict):
                    EUDict[genre+':'+plat] += game[3]
                else:
                    EUDict[genre+':'+plat] = game[3]
                if(plat in JPDict):
                    JPDict[genre+':'+plat] += game[4]
                else:
                    JPDict[genre+':'+plat] = game[4]
    if(genre in regionalDict):
        NA[genre].append(NADict)
        EU[genre].append(EUDict)
        JP[genre].append(JPDict)
    else:
        NA[genre] = NADict
        EU[genre] = EUDict
        JP[genre] = JPDict

holdNA = {}
for genre in NA:
    holdNA.update(NA[genre])

holdEU = {}
for genre in EU:
    holdEU.update(EU[genre])

holdJP = {}
for genre in JP:
    holdJP.update(JP[genre])

from heapq import nlargest

resNA = nlargest(10, holdNA, key=holdNA.get)
finalNA = {}
for i in range(0, 9):
    finalNA[resNA[i]] = holdNA[resNA[i]]


resEU = nlargest(10, holdEU, key=holdEU.get)
finalEU = {}
for i in range(0, 9):
    finalEU[resEU[i]] = holdEU[resEU[i]]

resJP = nlargest(10, holdJP, key=holdJP.get)
finalJP = {}
for i in range(0, 9):
    finalJP[resJP[i]] = holdJP[resJP[i]]


regionalDict['NA'] = finalNA
regionalDict['EU'] = finalEU
regionalDict['JP'] = finalJP
#combine data sets into a json object for use in node.js frontend
jsonData = {
    "genreData": finalDict,
    "regionalData": regionalDict
}
print(json.dumps(jsonData)) #printout to server for final read

#uncomment to create a json file for manual read
#with open('./python/salesData.json', 'w') as fp:
    #json.dump(jsonData, fp)

print('DONE')

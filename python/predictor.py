import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
import numpy as np
import json
import sys



data = sys.argv[1]
jIn = json.loads(data)
queryGenre = jIn['genre']
queryPlatform = jIn['platform']
queryYear = jIn['year']


#read all data in from file
dg = pd.read_csv('./python/vgsales.csv', sep=',', dtype=None, usecols=['Rank','Name', 'Platform', 'Genre', 'Year', 'NA_Sales','EU_Sales','JP_Sales','Other_Sales','Global_Sales'])

#filter by query genre and platform
#drop any rows with missing data
gOut = dg.query("(Genre == '"+queryGenre+"') and (Platform == '"+queryPlatform+"')").dropna()

#year is prediction query, use as x, sales is y
#convert to array for later reshape
y= np.array(gOut['Global_Sales'])
x= np.array(gOut['Year'])

#fit data into model
regressor = LinearRegression()
regressor.fit(x.reshape(-1,1), y.reshape(-1,1))
#optional future upgrade: implement accuracy testing using test data

#predict using model and query as year
pred = regressor.predict([[queryYear]])
#print(pred) #predicted global sales number based on trends


out = gOut['Global_Sales'].mean()


finalOutput = {}
finalOutput['predictedSales'] = float(abs(pred[0][0])) #get actual value inside nested array
finalOutput['averageSales'] = float(out) #actual value of mean sales over all known data of this combo

out = json.dumps(finalOutput)
print(out) #final print for server to read

print('DONE')

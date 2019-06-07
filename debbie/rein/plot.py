import matplotlib.pyplot as plt
import numpy as np
import math
import csv
from sklearn import svm
from sklearn import linear_model
import os
import json

def train(x, y):
  clf = svm.SVC(kernel = 'linear', gamma='scale', verbose=True)
  print 'start fitting'
  clf.fit(x, y)
  print clf.support_vectors_

def train2(x, y):
  clf = linear_model.LogisticRegression(class_weight='balanced')
  print 'start fitting'
  clf.fit(x, y)
  print clf.score(x, y)
  return clf 

def convert():
  f = open("decision_clothes.csv", "r", buffering = 10000000)
  reader = csv.reader(f)
  next(reader)

  data = [row for row in reader]
  print 'loaded'
  maps = np.asarray(data, dtype = np.int16)


  ll = []
  ct = 0
  for row in f.readlines():
    r = [int(i) for i in row.split(",")]
    ll.append(r)
    ct += 1
    if ct % 1000000 == 0:
      print ct
  np.save("decision_clothes", maps)
  return

def fit():
  maps = np.load("decision_clothes.npy")
  d = {}
  for gives in xrange(3):
    d[gives] = {}
    for ask in xrange(6,51):
      rows = maps[maps[:, 0] == gives]
      rows = rows[rows[:, 3] == ask]
      if sum(rows[:, 4]) == len(rows):
        #d[gives][ask] = True
        print gives,',',ask, 'skipped'
        continue
      clf = train2(rows[:, [1,2]], rows[:, 4])
      d[gives][ask] = clf.coef_.tolist()[0] + clf.intercept_.tolist()
      print gives,',',ask, d[gives][ask]
  print json.dumps(d, indent=2)

def doplot(maps, gives, ask):
  filename = "output_clothes/"+str(gives) + "-" + str(ask)+".png"
  if os.path.isfile(filename):
    print "skipped", filename
    return

  rows = maps[maps[:, 0] == gives]
  rows = rows[rows[:, 3] == ask]
  plot = rows[:, [1,2,4]]
  plt.title("gives = " + str(gives) + ", ask = " + str(ask))
  plt.scatter(plot[:, 0],plot[:, 1], s=1, color=['b' if x == 1 else 'r' for x in plot[:, 2]], marker=',')
  plt.xlabel('coins')
  plt.ylabel('potential')
  plt.savefig("output_clothes/"+str(gives) + "-" + str(ask), dpi=400)
  plt.clf()

def plot():
  maps = np.load("decision_clothes.npy")
  for c in xrange(0, 3):
    for ask in xrange(6,51):
      doplot(maps, c, ask)
  # gives,coins,potential,ask,give

fit()

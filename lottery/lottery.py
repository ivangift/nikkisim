import numpy as np
import random
from math import factorial
from math import log
from math import exp
from fractions import Fraction
from decimal import Decimal, getcontext
class Item(object):
  def __init__(self, name, prob):
    self.name = name
    self.prob = prob

class RoundRobin(object):
  def __init__(self, items):
    self.items = items
    self.sum = sum([item.prob for item in items])

  def roll(self):
    result = random.randint(0, self.sum - 1)
    for item in self.items:
      if (item.prob > result):
        return item
      result -= item.prob

POOL = [
  Item('0', 100/2),
  Item('1', 100/2),

  Item('2', 1620/5),
  Item('3', 1620/5),
  Item('4', 1620/5),
  Item('5', 1620/5),
  Item('6', 1620/5),

  Item('7', 6480/8),
  Item('8', 6480/8),
  Item('9', 6480/8),
  Item('10', 6480/8),
  Item('11', 6480/8),
  Item('12', 6480/8),
  Item('13', 6480/8),
  Item('14', 6480/8),

  Item('15', 37800/7),
  Item('16', 37800/7),
  Item('17', 37800/7),
  Item('18', 37800/7),
  Item('19', 37800/7),
  Item('20', 37800/7),
  Item('21', 37800/7),

  Item('22', 54000/5),
  Item('23', 54000/5),
  Item('24', 54000/5),
  Item('25', 54000/5),
  Item('26', 54000/5)
]

RR = RoundRobin(POOL)

def sim(items, count):
  if count <= 30 or (count-30) % 4:
    items.add(RR.roll())
  else:
    newpool = [p for p in POOL if p not in items]
    items.add(RoundRobin(newpool).roll())


def mc():
  ret = []
  for i in xrange(10000):
    cnt = 0
    wardrobe = set()
    while len(wardrobe) < len(POOL):
      cnt += 1
      sim(wardrobe, cnt)
    ret.append(cnt)
  print np.mean(ret), np.std(ret), np.median(ret)


# POOL2 = sorted([
#   (59, Fraction(0.628)),
#   (53, Fraction(0.25)),
#   (30, Fraction(0.025)),
#   (5, Fraction(0.062)),
#   (6, Fraction(0.03)),
#   (2, Fraction(0.005))
# ])
getcontext().prec=64
POOL2 = sorted([
  #(59, Decimal('0.628')),
  #(53, Decimal('0.25')),
  (30, Decimal('0.025')),
  #(5, Decimal('0.062')),
  #(6, Decimal('0.03')),
  #(2, Decimal('0.005'))
])

def comb(n, r):
  return factorial(n) // factorial(r) // factorial(n-r)

def expect(cluster, sum_items, sum_prob):
  if cluster >= len(POOL2):
    if sum_items == 0:
      return 0
    ret = 1 / sum_prob
    if sum_items % 2 == 0:
      ret = -ret
    return ret
  
  num = POOL2[cluster][0]
  total = 0
  for pick in xrange(0, num+1):
    cnt = comb(num, pick)
    prob = pick * POOL2[cluster][1] / num
    total += cnt * expect(cluster+1, sum_items + pick, sum_prob + prob)
  return total

def expect2(cluster, multi, sum_items, sum_prob):
  if cluster >= len(POOL2):
    if sum_items == 0:
      return 0
    ret = multi / sum_prob
    if sum_items % 2 == 0:
      ret = -ret
    return ret
  
  num = POOL2[cluster][0]
  total = 0
  for pick in xrange(0, num+1):
    cnt = comb(num, pick)
    prob = pick * POOL2[cluster][1] / num
    total += expect2(cluster+1, cnt * multi, sum_items + pick, sum_prob + prob)
  return total

def calc():
  #total = expect(0, 0, 0)
  total = expect2(0, 1, 0, 0)
  print float(total)

#mc()
calc()
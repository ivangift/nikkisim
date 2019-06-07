# -*- coding: utf-8 -*-
import random
import numpy
import csv

class Roulette(object):
  # both min and max are inclusive
  def __init__(self, min, max, prob):
    self.min = min
    self.max = max
    self.prob = prob

  def roll(self):
    return random.randint(self.min, self.max)

class RoundRobin(object):
  def __init__(self, roulettes):
    self.roulettes = roulettes
    self.sum = sum([r.prob for r in roulettes])

  def roll(self):
    result = random.randint(0, self.sum - 1)
    for r in self.roulettes:
      if (r.prob > result):
        return r.roll()
      result -= r.prob

class Environment(object):
  def __init__(self, coinCap, clothesPrice):
    self.coinCap = coinCap
    self.clothesPrice = clothesPrice
    self.nextAsk = RoundRobin(
      [
        Roulette(6, 20, 50),
        Roulette(21, 30, 40),
        Roulette(31, 50, 10),
      ]
    )
    self.nextStep = Roulette(5, 10, 1)
    self.criticalProb = 0.45
    self.coinPerStep = 2

  def reset(self, challenge):
    self.challenge = challenge
    self.step = self.nextStep.roll()
    self.coin = 0
    self.reward = 0
    self.criticalCounter = 0
    self.totalCoin = 0
    self.criticalCoin = 0
    self.forward()

  def forward(self):
    newCoin = self.step * self.coinPerStep
    moved = self.step
    self.coin += newCoin
    self.totalCoin += newCoin
    self.step = 0
    self.ask = self.nextAsk.roll()
    #print '过了 ' + str(moved) + ' 关, 得到 ' + str(newCoin) + ' 个代币后遇到了黛奥比'

  def canGive(self):
    return (not self.finished()) and (self.ask <= self.coin)

  def finished(self):
    if self.challenge == "NONE":
      return False
    if self.challenge == "GREEDY":
      return self.potential() < 0
    if self.challenge == "CLOTHES":
      return self.potential() < 0 or self.quota() <= 0

  def score(self):
    spent = self.totalCoin - self.coin
    return spent + self.criticalCoin

  def potential(self):
    return self.coinCap - self.totalCoin

  def quota(self):
    spent = self.totalCoin - self.coin
    return self.coinCap - self.clothesPrice - spent

  def critical(self):
    self.criticalCounter += 1
    if (self.criticalCounter < 3):
      return False
    if (random.random() < self.criticalProb):
      self.criticalCounter = 0
      return True
    return False
  
  def decide(self, give):
    if (self.step > 0):
      # forward first
      return
    if (give and self.canGive()):
      self.coin -= self.ask
      if (self.critical()):
        self.criticalCoin += self.ask
        #print '给了' + str(self.ask) + '代币 (自上次暴击后共 ' + str(self.criticalCounter + 1) + ' 次) 得到了暴击收益!'
      else:
        #print '给了 ' + str(self.ask) + ' 代币'
        pass
    else:
      # should do nothing
      #print '没给'
      pass

    self.step = self.nextStep.roll()
    self.forward()

  def stats(self):
    return '累计代币: ' + str(self.totalCoin) + ', 触发暴击的代币: ' + str(self.criticalCoin) + ', 得分: ' + str(self.score())

  def toString(self):
    return '目前代币: ' + str(self.coin) + ', 黛奥比索要: ' + str(self.ask) + ', 自上次暴击后给了 ' + str(self.criticalCounter) + ' 次'

_ask_prob = {}
def init():
  for ask in xrange(6, 51):
    if ask <= 20:
      _ask_prob[ask] = 0.5 / 15
    elif ask <= 30:
      _ask_prob[ask] = 0.4 / 10
    else:
      _ask_prob[ask] = 0.1 / 20

forward_buffer = []

def estimate_forward(coins, counter, potential, clothes_price):
  key = (counter, coins, potential/2)
  buf = get_buffer(forward_buffer, key)
  if buf:
    return buf

  if potential + coins <= clothes_price:
    return 0

  reward = 0
  for step in xrange(10, 21, 2):
    newcoins = coins + step
    newpotential = potential - step
    if (newpotential < 0):
      continue # stop
    for ask in xrange(6, 51):
      est = estimate_state(newcoins, ask, counter, newpotential, clothes_price)
      reward += _ask_prob[ask] * est
  reward /= 6
  set_buffer(forward_buffer, key, reward)
  return reward

state_buffer = []
action_buffer = []

def estimate_state(coins, ask, counter, potential, clothes_price):
  key = (counter, coins, potential/2, ask)
  buf = get_buffer(state_buffer, key)
  if buf:
    return buf

  result = 0
  give = False
  if coins >= ask:
    basecoin = coins - ask
    reward = ask
    give = True
    if counter < 2:
      result = reward + estimate_forward(basecoin, counter + 1, potential, clothes_price)
    else:
      result = 0.45 * (2*reward + estimate_forward(basecoin, 0, potential, clothes_price)) + 0.55 * (reward + estimate_forward(basecoin, 2, potential, clothes_price))
  
  ar = estimate_forward(coins, counter, potential, clothes_price)
  if ar > result:
    result = ar
    give = False

  set_buffer(state_buffer, key, result)
  set_buffer(action_buffer, key, give)
  return result

def has_buffer(buffer, keys):
  for k in keys:
    if not buffer[k]:
      return False
    buffer = buffer[k]
  return True

def get_buffer(buffer, keys):
  for k in keys:
    buffer = buffer[k]
  return buffer

def set_buffer(buffer, keys, value):
  for k in keys[:-1]:
    buffer = buffer[k]
  buffer[keys[-1]] = value

def simulate(e, game):
  e.reset(game)
  while not e.finished():
    if not e.canGive():
      e.decide(False)
    else:
      e.decide(get_buffer(action_buffer, (min(e.criticalCounter, 2), e.coin, e.potential()/2, e.ask)))
  return e.score()

def test():
  global forward_buffer
  global action_buffer
  global state_buffer
  init()
  cap = 2500
  action_buffer = numpy.full((3, cap+1, cap/2+1, 51), None)
  state_buffer = numpy.full((3, cap+1, cap/2+1, 51), None)
  forward_buffer = numpy.full((3, cap+1, cap/2+1), None)

  print estimate_forward(0, 0, cap, 1240)
  e = Environment(cap, 1240)
  x = [simulate(e, "CLOTHES") for i in xrange(1000)]
  print sum(x)/len(x), min(x), max(x)
  numpy.save('decision_clothes_raw', state_buffer)

test()
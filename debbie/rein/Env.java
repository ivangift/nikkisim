import java.util.*;
import java.lang.*;
import java.io.*;

class Env {
  public static void main(String[] args) throws java.lang.Exception {
    int cap = 2500;  
    actionBuffer = new Float[cap+1][cap/2+1][3][51];
    giveBuffer = new Boolean[cap+1][cap/2+1][3][51];
    forwardBuffer = new Float[cap+1][cap/2+1][3];
  
    System.out.println(estimateForward(0, 0, cap, 1240));
    FileWriter fw = new FileWriter("decision_clothes.csv");
    fw.write("gives,coins,potential,ask,give\n");
    for (int counter = 0; counter < 3; counter++) {
      for (int coin = 10; coin<=cap; coin ++) {
        for (int ask = 6; ask <= 50; ask ++) {
          for (int p = 0 ; p < cap/2+1; p ++) {
            if (coin >= ask && giveBuffer[coin][p][counter][ask] != null) {
              fw.write(counter + "," + coin + "," + p*2 + "," + ask + ","+(giveBuffer[coin][p][counter][ask]?1:0) + "\n");
            }
          }
        }
      }
    }
    fw.close();
  }

  private static Float[][][][] actionBuffer;
  private static Boolean[][][][] giveBuffer;
  private static Float[][][] forwardBuffer;

  private static boolean hasBuffer(Object[] buffer, int... keys) {
    Object next = buffer;
    for (int k : keys) {
      buffer = (Object[]) next;
      next = buffer[k];
      if (next == null) return false;
    }
    return true;
  }

  private static Object getBuffer(Object[] buffer, int... keys) {
    Object next = buffer;
    for (int k : keys) {
      buffer = (Object[]) next;
      next = buffer[k];
    }
    return next;
  }

  private static void setBuffer(Object[] buffer, Object value, int... keys) {
    Object next = buffer;
    for (int i = 0; i < keys.length - 1; i++) {
      int k = keys[i];
      buffer = (Object[]) next;
      next = buffer[k];
    }
    buffer = (Object[]) next;
    buffer[keys[keys.length-1]] = value;
  }

  private static boolean hasForward(int coins, int counter, int potential) {
    return hasBuffer(forwardBuffer, coins, potential, counter);
  }

  private static float getForward(int coins, int counter, int potential) {
    return (Float) getBuffer(forwardBuffer, coins, potential, counter);
  }

  private static void setForward(int coins, int counter, int potential, float value) {
    setBuffer(forwardBuffer, value, coins, potential, counter);
  }

  private static float prob(int ask) {
    if (ask <= 20) return 0.5f/15;
    if (ask <= 30) return 0.4f/10;
    return 0.1f/20;
  }

  private static float estimateForward(int coins,  int counter, int potential, int clothesPrice /* const */) {
    if (hasForward(coins, counter, potential/2)) {
      return getForward(coins, counter, potential/2);
    }

    if (potential + coins <= clothesPrice) {
      return 0;
    }

    float reward = 0;
    for (int step = 10; step < 22; step += 2) {
      int newcoins = coins + step;
      int newpotential = potential - step;
      if (newpotential < 0) {
        continue;
      }
      for (int ask = 6; ask <= 50; ask++) {
        float est = estimateState(newcoins, ask, counter, newpotential, clothesPrice);
        reward += prob(ask) * est;
      }
    }
    reward /= 6;
    setForward(coins, counter, potential/2, reward);
    return reward;
  }

  private static boolean hasAction(int coins, int ask, int counter, int potential) {
    return hasBuffer(actionBuffer, coins, potential, counter, ask);
  }

  private static float getAction(int coins, int ask, int counter, int potential) {
    return (Float) getBuffer(actionBuffer, coins, potential, counter, ask);
  }

  private static void setAction(int coins, int ask, int counter, int potential, float value, boolean give) {
    setBuffer(actionBuffer, value, coins, potential, counter, ask);
    setBuffer(giveBuffer, give, coins, potential, counter, ask);
  }

  private static float estimateState(int coins, int ask, int counter, int potential, int clothesPrice /* const */) {
    if (hasAction(coins, ask, counter, potential/2)) {
      return getAction(coins, ask, counter, potential/2);
    }
    float result = 0;
    boolean give = false;
    if (coins >= ask) {
      int baseCoin = coins - ask;
      int reward = ask;
      give = true;

      if (counter < 2) {
        result = reward + estimateForward(baseCoin, counter + 1, potential, clothesPrice);
      } else {
        result = 0.45f * (2*reward + estimateForward(baseCoin, 0, potential, clothesPrice))
         + 0.55f * (reward + estimateForward(baseCoin, 2, potential, clothesPrice));
      }
    }
    float ar =  estimateForward(coins, counter, potential, clothesPrice);
    if (ar > result) {
      result = ar;
      give = false;
    }
    setAction(coins, ask, counter, potential/2, result, give);
    return result;
  }
}
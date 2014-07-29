import pyfirmata
from pyfirmata import Arduino, util
import time
import urllib

def saveLocation(newLocation)
    print "allo"
    f = open('headPosition.txt','r')
    locationPercent = f.read()
    f.close()
    f = open('headPosition.txt','w')
    f.write(str(newLocation))
    f.close()

def fetchHappyCoeff():
    URL = "http://www.bilalghalib.com/crushornot/"
    f = urllib.urlopen(URL)
    stringFromSite = f.read(100)#read the first 100 bytes of the site
    intFromSite = int(stringFromSite)
    return intFromSite

def makeValueJudgement(happyCoeff):
    print "The world is ",
    if happyCoeff==0:
        print "In Balence"
    elif happyCoeff > 0:
        print "extraHappy"
    elif happyCoeff < 0:
        print "extraSad"


if __name__ == '__main__':
    print "Welcome To QueryCrushOrNot"
    intFromSite= fetchHappyCoeff()
    saveLocation(intFromSite)
    makeValueJudgement(intFromSite)
    print intFromSite

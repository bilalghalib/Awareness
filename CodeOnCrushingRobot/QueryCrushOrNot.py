import sys
sys.path.insert(0, '../') 
#this allows us to get modules from one level above us like loginInfo down there:
import loginInfo
import runsRobot
import time
import urllib
import awareness_getresponses

import thread

def moveDistanceDelta(rob):
    rob.moveToPosition()
    time.sleep(1)
    runsRobot.moveMotor(1500)
    rob.currentLocation
    rob.writeCurrentHeadPosition()

def closeSerialPort():
    runsRobot.board.exit()

class crushBot(object):
    currentLocation=0
    desiredLocation=0
    connectionToMySQL = loginInfo.connectToMySQL()
    cursorForSQL = connectionToMySQL.cursor()
    def __init__(self):
            self.apple=0
    def readCurrentHeadPosition(self):
        f = open('headPosition.txt','r')
        locationPosition = f.read()
        f.close()
        crushBot.currentLocation = int(locationPosition)
        return crushBot.currentLocation
    def writeCurrentHeadPosition(self):
        f = open('headPosition.txt','w')
        f.write(str(crushBot.currentLocation))
        f.close()
    def readHeadPositionFromInternet(self):
        crushBot.desiredLocation = int(awareness_getresponses.getDamageLevel(crushBot.cursorForSQL))
        return crushBot.desiredLocation
    def moveToPosition(self):
        print "The world is "
        if runsRobot.isSafeToMove():
            if (crushBot.desiredLocation - crushBot.currentLocation) > 0: #if we're higher and need to move down crush
                runsRobot.moveMotor(1250)
                print "crush"
                crushBot.currentLocation = crushBot.currentLocation+1
            if (crushBot.desiredLocation - crushBot.currentLocation) < 0:
                runsRobot.moveMotor(1750)
                print "uncrush"
                crushBot.currentLocation = crushBot.currentLocation-1
            if (crushBot.desiredLocation - crushBot.currentLocation) == 0:
                runsRobot.moveMotor(1500)
                print "do nothing"

rob = crushBot()
rob.readHeadPositionFromInternet()
rob.readCurrentHeadPosition()
rob.moveToPosition()
moveDistanceDelta(rob)
closeSerialPort()

#if __name__ == '__main__':
#print "Welcome To QueryCrushOrNot"
	#connect to the sql database
#!/usr/bin/python
import sys
sys.path.insert(0, '../') 
print('\a')

#this allows us to get modules from one level above us like loginInfo down there:
import loginInfo
import runsRobot
import time
import urllib
import awareness_getresponses

def moveDistanceDelta(rob):
    rob.moveToPosition()
    time.sleep(1)
    runsRobot.moveMotor(1500)
    rob.currentLocation
    rob.writeCurrentHeadPosition()

def moveOneSec(rob,speed):
    runsRobot.moveMotor(speed)
    time.sleep(.5)
    runsRobot.moveMotor(1500)

def closeSerialPort():
    runsRobot.board.exit()

class crushBot(object):
    connectionToMySQL = loginInfo.connectToMySQL()
    cursorForSQL = connectionToMySQL.cursor()
    def __init__(self):
            self.currentLocation=0
            self.desiredLocation=0
    def readCurrentHeadPosition(self):
        f = open('headPosition.txt','r')
        locationPosition = f.read()
        f.close()
        print locationPosition
        self.currentLocation = int(locationPosition)
        return self.currentLocation
    def writeCurrentHeadPosition(self):
        f = open('headPosition.txt','w')
        f.write(str(self.currentLocation))
        f.close()
    def readHeadPositionFromInternet(self):
        self.desiredLocation = int(awareness_getresponses.getDamageLevel(self.cursorForSQL))
        return self.desiredLocation
    def moveToPosition(self):
        print "The world is "
        if runsRobot.returnAtTop()==False:
            if (self.desiredLocation - self.currentLocation) > 0: #if we're higher and need to move down crush
                runsRobot.moveMotor(1750)
                print "uncrush"
                self.currentLocation = self.currentLocation+1
        else:
            self.currentLocation=100
        if runsRobot.returnAtBottom()==False:
            if (self.desiredLocation - self.currentLocation) < 0:
                runsRobot.moveMotor(1250)
                print "crush"
                self.currentLocation = self.currentLocation-1
        else:
            self.currentLocation=0
        if (self.desiredLocation - self.currentLocation) == 0:
                runsRobot.moveMotor(1500)
                print "do nothing"

rob = crushBot()
rob.readHeadPositionFromInternet()
print rob.desiredLocation
rob.readCurrentHeadPosition()

#go all the way up if you get special command 999
if(rob.currentLocation==999):
    for x in xrange(1,100):
        print x
        if (runsRobot.returnAtTop()==True):
            rob.currentLocation=100
            rob.currentLocation
            rob.writeCurrentHeadPosition()
            break;
        else:
            moveOneSec(rob,1750)

moveDistanceDelta(rob)
time.sleep(1)
closeSerialPort()

#if __name__ == '__main__':
#print "Welcome To QueryCrushOrNot"
	#connect to the sql database

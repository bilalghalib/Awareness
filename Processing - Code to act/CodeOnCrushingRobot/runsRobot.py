#!/usr/bin/python

import pyfirmata
from pyfirmata import Arduino, util
import time
from time import sleep

arduinoNano= {
        'digital' : tuple(x for x in range(14)),
        'analog' : tuple(x for x in range(8)),
        'pwm' : (3, 5, 6, 9, 10, 11),
        'use_ports' : True,
        'disabled' : (0, 1) # Rx, Tx, Crystal
    }

MAC_PORT = '/dev/tty.usbserial-A92LPJB3'
HP_PORT1 = '/dev/ttyUSB1'
HP_PORT0 = '/dev/ttyUSB0'
# urllib.urlopen("http://www.musi-cal.com/cgi-bin/query?%s"
#Current_Serial_PORT = HP_PORT
try:
    board = pyfirmata.Arduino(HP_PORT1)
    print "port 1"
except Exception, e:
    print "not 1"
try:
    board = pyfirmata.Arduino(HP_PORT0)
    print "port 0"
except Exception, e:
    print "not 0"

board.setup_layout(arduinoNano)

board.servo_config(9, 1000, 2000, 0)
servoPin =board.digital[9]
servoPin.mode = pyfirmata.SERVO

it = util.Iterator(board)
it.start()

board.analog[6].enable_reporting()
board.analog[7].enable_reporting()
servoPin.write(1500)
squishedTrigger = board.get_pin('a:6:i')
allTheWayUpTrigger = board.get_pin('a:7:i')
servoPin.write(1500)

def returnAtBottom():
    if(squishedTrigger.read() < .3):
        return True
    else:
        return False

def returnAtTop():
    if(allTheWayUpTrigger.read() < .3):
        return True
    else:
        return False

def isSafeToMove():
    if( squishedTrigger.read() < .3 or allTheWayUpTrigger.read() < .3):
        return False
    else:
        return True

def moveMotor(speed):
    servoPin.write(speed) #moves the robot up up if >1500 and down if <1500

# while True:
#     if goingUp:
#         servoPin.write(2000)
#     else:
#         servoPin.write(1000)
#     # print squishedTrigger.read()
#     if(squishedTrigger.read() < .3):
#         bottomTime=time.time()
#         # print "Go UP!"
#         goingUp = True
#         # print time.time()
#     if (allTheWayUpTrigger.read() < .3):
#         topTime=time.time()
#         # print "Go Down!"
#         goingUp = False
#         # print time.time()
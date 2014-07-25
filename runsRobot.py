import pyfirmata
from pyfirmata import Arduino, util
import time

arduinoNano= {
        'digital' : tuple(x for x in range(14)),
        'analog' : tuple(x for x in range(8)),
        'pwm' : (3, 5, 6, 9, 10, 11),
        'use_ports' : True,
        'disabled' : (0, 1) # Rx, Tx, Crystal
    }


MAC_PORT = '/dev/tty.usbserial-A92LPJB3'
HP_PORT = '/dev/ttyUSB1'
# urllib.urlopen("http://www.musi-cal.com/cgi-bin/query?%s"

Current_Serial_PORT = HP_PORT
board = pyfirmata.Arduino(Current_Serial_PORT)
board.setup_layout(arduinoNano)

board.servo_config(9, 1000, 2000, 0)
servoPin =board.digital[9]
servoPin.mode = pyfirmata.SERVO

it = util.Iterator(board)
it.start()

board.analog[6].enable_reporting()
board.analog[7].enable_reporting()

squishedTrigger = board.get_pin('a:6:i')
allTheWayUpTrigger = board.get_pin('a:7:i')
servoPin.write(2000) #moves the robot up at full speed
servoPin.write(1500) #Stops the robot
servoPin.write(1000) #moves the robot down at full speed

goingUp=True
bootTime=time.time()

while True:
	if goingUp:
		servoPin.write(2000)
	else:
		servoPin.write(1000)
	# print squishedTrigger.read()
	if(squishedTrigger.read() < .3):
		bottomTime=time.time()
		# print "Go UP!"
		goingUp = True
		# print time.time()
	if (allTheWayUpTrigger.read() < .3):
		topTime=time.time()
		# print "Go Down!"
		goingUp = False
		# print time.time()

print 'bootTime: %f'%bootTime
print 'topTime: %f'%topTime
print 'bottomTime: %f'%bottomTime
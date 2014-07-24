import pyfirmata
from pyfirmata import Arduino, util

arduinoNano= {
        'digital' : tuple(x for x in range(14)),
        'analog' : tuple(x for x in range(8)),
        'pwm' : (3, 5, 6, 9, 10, 11),
        'use_ports' : True,
        'disabled' : (0, 1) # Rx, Tx, Crystal
    }

PORT = '/dev/tty.usbserial-A92LPJB3'
board = pyfirmata.Arduino(PORT)
board.setup_layout(arduinoNano)

board.servo_config(9, 1000, 2000, 0)
p=board.digital[9]
p.mode = pyfirmata.SERVO

it = util.Iterator(board)
it.start()

board.analog[6].enable_reporting()
board.analog[7].enable_reporting()

squishedTrigger = board.get_pin('a:6:i')
allTheWayUpTrigger = board.get_pin('a:7:i')
p.write(2000) #moves the robot up at full speed
p.write(1500) #Stops the robot
p.write(1000) #moves the robot down at full speed

#goingUp=True;
#while True:
#	if goingUp:
#		p.write(2000)
#	else:
#		p.write(1000)
#	print squishedTrigger.read()
#	if(squishedTrigger.read() < .3):
#		print "Go UP!"
#		goingUp = True
#		print time.time()
#	if (allTheWayUpTrigger.read() < .3):
#		print "Go Down!"
#		goingUp = False
#		print time.time()

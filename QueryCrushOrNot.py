import pyfirmata
from pyfirmata import Arduino, util
import time
import urllib

URL = "http://www.bilalghalib.com/crushornot/"

f = urllib.urlopen(URL)
stringFromSite = f.read(100)
print stringFromSite
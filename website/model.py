import web
from random import randrange

db = web.database(dbn='mysql', db='change', user='change',pw='change' )

def get_alerts():
    return db.select('Alerts')

def new_alerts(validator, sendURL):
    db.insert('Alerts', ValidatorScreenName=validator, URL=sendURL, Tweetid=randrange(1000000), isValid=1)

def new_Validator(newValidator):
    print "new validator"
    print newValidator 
    if newValidator:
        db.insert('Volunteers', validator=newValidator)

def new_Responder(newResponder):
    print "new Responder"
    print newResponder 
    if newResponder:
        db.insert('Volunteers', kindnessResponder=newResponder)

def del_alert(id):
    whereIs = "Tweetid="+ str(id)
    db.delete('Alerts', where=whereIs)

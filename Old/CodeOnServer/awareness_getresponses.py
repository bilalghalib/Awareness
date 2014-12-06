#!/usr/bin/python
# -*- coding: utf-8 -*-
#july 25 2014 refactoring code

import random
import pickle
import datetime
from datetime import timedelta
from datetime import datetime
from time import sleep
import sys
import urllib2
import loginInfo

#grab the most recent percent damaged number from the database
def getDamageLevel(cursorForSQL):
    damageLevel = int()
    try:
        cursorForSQL.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
        damageLevel = cursorForSQL.fetchone()[0]
    except:
        print "couldn't update damage"
    return damageLevel

#update bilalghalib.com/crushornot so that the robot can see the current percent damage and do something about it
def updateCrushPercentPage():
    f = open('../crushornot/index.html','r')
    myInt = int(f.read())
    f.close()
    f = open('../crushornot/index.html','w')
    myint = myInt + 10
    f.write(str(myint))
    f.close()

#What tweets have already been flagged as unverified?
def getResponses(cursorForSQL):
    alertids = dict()
    numentries = \
        cursorForSQL.execute('SELECT responseTweetID, respondedToTweetID FROM Responders;' 
                    )
    count = 0
    while count < numentries:
        responseTweetID, respondedToTweetID = cursorForSQL.fetchone()
        if respondedToTweetID in alertids:
            alertids[respondedToTweetID].append(responseTweetID)                
        else:
            alertids[respondedToTweetID] = [responseTweetID]
        count += 1
    return alertids

def checkForResponses(kindnessResponders, potentialResponses, connectionToMySQL, cursorForSQL, twitter):
    for p in kindnessResponders['users']:
        timeline = twitter.get_user_timeline(screen_name=p['screen_name'],count=200, exclude_replies=False)
        for t in timeline:
            if  (t['in_reply_to_status_id'] in potentialResponses):
                print "the original tweet:" + str(t['in_reply_to_status_id'])
                print "the tweet that is the response " + str(t['id'])
                print "the event:" + str(potentialResponses[t['in_reply_to_status_id']])
                positiveResponseText = twitter.show_status(id=t['id'])['text']
                positiveResponseText = positiveResponseText.replace("'","`")
                positiveResponseTime = twitter.show_status(id=t['id'])['created_at']
                updatedDamageLevel = getDamageLevel(cursorForSQL) + 10
                try:
                    cursorForSQL.execute("""INSERT INTO Response (percentDamaged, damageURL, positiveAction, timeAndDate, timePositive) VALUES (%s,'%s','%s','%s', '%s');""" % 
                        (updatedDamageLevel, 'NULL', positiveResponseText, datetime.now().isoformat(' '), positiveResponseTime.encode('utf-8')) )
                    try:
                        updateCrushPercentPage()
                    except: 
                        print "Can't update page"
                except Exception, e:
                    print e
                connectionToMySQL.commit()

if __name__ == '__main__':
    print "Welcome to gerResponses where we will see if people have been nice in response to the violence in Iraq."
    connectionToMySQL = loginInfo.connectToMySQL()
    cursorForSQL = connectionToMySQL.cursor()
    twitter = loginInfo.connectToTwitter()
    potentialResponses = getResponses(cursorForSQL) # responses() returns a dictionary of events where the key is the tweet we sent the responder and it returns the bad event's tweetID
    del potentialResponses[None] # this deletes any empty dictionary elements, not sure why we get one

    kindnessResponders = twitter.get_list_members(slug='kindness-responders'
        , owner_screen_name='weaware')

    checkForResponses(kindnessResponders, potentialResponses, connectionToMySQL, cursorForSQL, twitter)

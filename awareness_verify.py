#!/usr/bin/python
# -*- coding: utf-8 -*-
#july 25 2014 refactoring code

from twython import Twython
import random
import urllib2
import httplib
import MySQLdb as mdb
from datetime import datetime
import loginInfo

import bitlyapi

#connect to urlshortener
API_USER = "d"
API_KEY = "d"

bitlyShortener = bitlyapi.BitLy(API_USER, API_KEY)

#This will follow a shortened URL to get the final destination.
#This is useful because it allows us to quickly determine if we've been to an article before.
def followURL(url):
    request = urllib2.Request(url)
    request.add_header('User-Agent',
                       'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0'
                       )
    opener = urllib2.build_opener()
    f = opener.open(request)
    return f.url

#Straightforward. Ask our volunteers to do something about an event that was validated.
def tweetUponAngels(verifierScreenName, URLOut, tweetID):
    shortURLOut="NULL"
    kindnessResponders = twitter.get_list_members(slug='kindness-responders'
        , owner_screen_name='weaware')
    try:
        shortURLOut = bitlyShortener.shorten(longUrl=URLOut)
    except:
        print "blitdang"
    try:
        for kindPerson in kindnessResponders['users']:
            messageOfKindness = '@' + kindPerson['screen_name']\
            + ' Something bad happened. Please respond with an act of kindness. Event validated by @' + verifierScreenName + ' '  + shortURLOut['url']
            try:
                theMessage = twitter.update_status(status=messageOfKindness)
            except:
                print "couldn't tweet the message"
            messageToResponderID = theMessage['id']
            try:
                cur.execute("INSERT INTO Responders (kindnessResponderScreenName, respondedToTweetID, responseTweetID, timeAndDate) VALUES ('%s', %s, %s, '%s');"
                % (kindPerson['screen_name'], messageToResponderID, tweetID, datetime.now().isoformat(' ') ))
            except:
                print "couldn't update Responders table"
    except:
            print "something broke in tweeting upon angels"

#Announce that a person has verified an article. 
def sendVerifiedTweet(tweetPerson,idOut):
    messageOfVerification = '.@' + tweetPerson\
    + ' has verified this attack: ' + 'https://twitter.com/%s/status/%s/' % (tweetPerson, idOut)
    print messageOfVerification[0:139]
    try:
        print messageOfVerification
        twitter.update_status(status=messageOfVerification)
        twitter.create_favorite(id=idOut)
    except:
        print "dupe"

#What tweets have we already asked for verification?
def getAlertedTweets():
    alertids = list()
    numentries = \
        cur.execute('SELECT Tweetid FROM Alerts where isPublished is NULL;'
                    )
    count = 0
    while count < numentries:
        alertids.append(cur.fetchone()[0])
        count += 1
    return alertids

#Get the sets of people who verify (peopleWhoCare) 
#and the people who carry out kind acts (kindnessResponders)
peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
        , owner_screen_name='weaware')

#Get the tweets we've already asked for verification with
alertedtweets = getAlertedTweets()

#For every person in the set of verifiying users,
#Check their recent statuses. If their status contains a retweet of a status
#we asked about, try to inset that verification into our Verifications table.
#Set the isPublished and isValid flags to 1(need more info about what these flags mean...)
for p in peopleWhoCare['users']:
    timeline = twitter.get_user_timeline(screen_name=p['screen_name'],
            count=20, exclude_replies=False)
    retweets = list()
    for t in timeline:
        try:
            if t['retweeted_status'] is not None:
                retweets.append(t)
        except KeyError:
            print 'Not a retweet'
        #this code will check to see if someone nullified the tweet:
        if t['in_reply_to_screen_name']:
            try:
                lenOfReplyToName=len(t['in_reply_to_screen_name'])+2 #for the @ sign and the space
                print t['text'][0:lenOfReplyToName+5]
                if t['in_reply_to_status_id'] in alertedtweets and (
                    t['text'][lenOfReplyToName:lenOfReplyToName+5]=="false" or t['text'][lenOfReplyToName:lenOfReplyToName+1]=="F" or t['text'][lenOfReplyToName:lenOfReplyToName+1]=="N"): 
                    cur.execute("UPDATE Alerts SET isValid=2 WHERE Tweetid=(%s);" % (t['in_reply_to_status_id']) )
                    print 'Found a Nullified Tweet'
                    print t['in_reply_to_status_id']
            except:
                print 'Not a nullified tweet'
        try:
            if t['in_reply_to_screen_name'] == 'weaware' and (
                t['text'][0:13]=="@weaware real"[0:13] or t['text'][0:13]=="@weaware true"[0:13] or t['text'][0:10]=="@weaware T"): 
                retweets.append(t)
                print 'Found a reply'
        except KeyError:
            print 'Not a retweet'
    for r in retweets:
        try:
            if ( long(r['retweeted_status']['id']) in alertedtweets ):
                try:
                    tweetUponAngels(r['user']['screen_name'],'https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id']), r['retweeted_status']['id'] )
                except e:
                    print "Tweet Broke"
                    print e
                theText=r['retweeted_status']['text'].replace("'","`")
                try:
                    try:
                        cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
                        % (r['retweeted_status']['user']['screen_name'], theText, r['retweeted_status']['id'],
                            r['user']['screen_name'], r['id']))
                    except:
                        print "couldn't verify"
                    try:
                        f = open('../crushornot/index.html','r')
                        myInt = int(f.read())
                        f.close()
                        f = open('../crushornot/index.html','w')
                        myint = myInt - 10
                        f.write(str(myint))
                        f.close()
                    except Exception as e:
                        print "can't update crushing page"
                    try:
                        cur.execute("UPDATE Alerts SET isPublished=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                        cur.execute("UPDATE Alerts SET isValid=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                    except:
                        print "couldn't update alerts"
                    try:
                        cur.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
                        updatedDamageLevel = cur.fetchone()[0]-10
                        curURL='https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id'])
                        cur.execute("INSERT INTO Response (percentDamaged, damageURL, positiveAction, timeAndDate) VALUES (%s,'%s','%s','%s');" % 
                        (updatedDamageLevel, curURL, 'NULL', datetime.now().isoformat(' ')  ) )
                    except Exception as e:
                        print "couldn't update damage"
                        print e
                    conn.commit()
                    try:
                        sendVerifiedTweet(r['user']['screen_name'],r['retweeted_status']['id']) 
                    except:
                        print "second tweet no work"
                except mdb.Error, e:
                        print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'
                        print e
        except:
            print "there is no retweeted status yo"

##the following code checks to see if anyone has validated things from alternatie sources.

cur.execute("SELECT URL, ValidatorScreenName, Tweetid FROM Alerts where isPublished IS NULL AND isValid=1;")
for ValidatedEvents in cur:
    tweetUponAngels(ValidatedEvents[1],ValidatedEvents[0])
    try:
        cur.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
        updatedDamageLevel = cur.fetchone()[0]-10
        cur.execute("INSERT INTO Response (percentDamaged, damageURL, positiveAction, timeAndDate) VALUES (%s,'%s','%s','%s');" % 
            (updatedDamageLevel, ValidatedEvents[0], 'NULL', datetime.now().isoformat(' ')  ) )
        print "Damage updated"
    except:
        print "sommatBorked"
    try:
        cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
        % (tweetPerson, 'noTweetText', 00000,
        ValidatedEvents[1], ValidatedEvents[2]))
    except mdb.Error, e:
        print '1Something went wrong. Probably a primary key violation, which is Okey dokey!'
    try:
        cur.execute("UPDATE Alerts SET isPublished=1 WHERE (Tweetid=(%s) AND ValidatorScreenName='%s');" % (ValidatedEvents[2],ValidatedEvents[1]))
    except mdb.Error, e:
        print '2Something went wrong. Probably a primary key violation, which is Okey dokey!'
    conn.commit()
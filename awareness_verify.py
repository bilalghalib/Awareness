#!/usr/bin/python
# -*- coding: utf-8 -*-
from twython import Twython
import random
import urllib2
import httplib
import MySQLdb as mdb
from datetime import datetime

#Connect to our database.
conn = mdb.connect('localhost', 'change', '-5-change', 'change')
cur = conn.cursor()

APP_KEY = 'change'
APP_SECRET = 'change'
OAUTH_TOKEN = 'change-change'
OAUTH_TOKEN_SECRET = 'change'

#Authenticate our app with twitter
twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

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
def tweetUponAngels(tweetPerson,URLOut):
    for kindPerson in kindnessResponders['users']:
        messageOfKindness = '@' + kindPerson['screen_name']\
        + ' Something bad happened. Please respond with an act of kindness. This event was validated by: @' + tweetPerson + ' '  + URLOut
        try:
            #twitter.update_status(status=messageOfKindness[0:139])
            print message
        except:
            print "probably a dupe"

#Announce that a person has verified an article. 
def sendVerifiedTweet(tweetPerson,idOut):
    messageOfVerification = '.@' + tweetPerson\
    + ' has verified this attack: ' + 'https://twitter.com/%s/status/%s/' % (tweetPerson, idOut)
    print messageOfVerification[0:139]
    try:
        print messageOfVerification
        #twitter.update_status(status=messageOfVerification[0:139])
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
kindnessResponders = twitter.get_list_members(slug='kindness-responders'
        , owner_screen_name='weaware')

#Get the tweets we've already asked for verification with
alertedtweets = getAlertedTweets()

#For every person in the set of verifiying users,
#Check their recent statuses. If their status contains a retweet of a status
#we asked about, try to inset that verification into our Verifications table.
#Set the isPublished and isValid flags to 1(need more info about what these flags mean...)
for p in peopleWhoCare['users']:
    timeline = twitter.get_user_timeline(screen_name=p['screen_name'],
            count=200, exclude_replies=True)
    retweets = list()
    for t in timeline:
        try:
            if t['retweeted_status'] is not None:
                retweets.append(t)
        except KeyError:
            print 'Not a retweet'
    for r in retweets:
        if ( long(r['retweeted_status']['id']) in alertedtweets ):
            try:
                cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);"
                    % (r['retweeted_status']['user']['screen_name'], r['retweeted_status'
                        ]['text'], r['retweeted_status']['id'],
                        r['user']['screen_name'], r['id']))
                cur.execute("UPDATE Alerts SET isPublished=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                cur.execute("UPDATE Alerts SET isValid=1 WHERE Tweetid=(%s);" % (r['retweeted_status']['id']) )
                cur.execute("SELECT percentDamaged FROM Response ORDER BY timeAndDate DESC LIMIT 1;")
                updatedDamageLevel = cur.fetchone()[0]-10
                curURL='https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id'])
                cur.execute("INSERT INTO Response (percentDamaged, damageURL, positiveAction, timeAndDate) VALUES (%s,'%s','%s','%s');" % 
                    (updatedDamageLevel, curURL, 'NULL', datetime.now().isoformat(' ')  ) )
                )
                sendVerifiedTweet(r['user']['screen_name'],r['retweeted_status']['id']) 
                for kindPerson in kindnessResponders['users']:
                    tweetUponAngels(r['user']['screen_name'],'https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id']))
                conn.commit()
            except mdb.Error, e:
                print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'

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
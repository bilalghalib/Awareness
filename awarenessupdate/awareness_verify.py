#!/usr/bin/python
# -*- coding: utf-8 -*-
from twython import Twython
import random
import urllib2
import httplib
import MySQLdb as mdb
from datetime import datetime

import bitlyapi

#connect to urlshortener

API_USER = "o_2fj7of362k"
API_KEY = "R_612773c3ad8a4ceeaf936f7a872c6c1d"

bitlyShortener = bitlyapi.BitLy(API_USER, API_KEY)


#Connect to our database.
conn = mdb.connect('localhost', 'awareness', '-5-fqRG7h1C1w93v4cXZLreFx', 'awareness')
cur = conn.cursor()

APP_KEY = 'JBWxj33Qv1fXPgzossjV3g'
APP_SECRET = '0uSXJYofTiiyz2nNkgP2ko1c1niFSBABYO3BpQgzg'
OAUTH_TOKEN = '2362763762-3n6lBjHvvoE5tcMKRJS0iMyF8kWYlhLhiH5j6U5'
OAUTH_TOKEN_SECRET = 'IrVhcN6edKbMy06ItGoRxIlxLh1CFbhO8UyBx5l3QIELg'

#Authenticate our app with twitter
twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)


thestatus="@bilalghalib Something bad happened. Please respond with an act of kindness. Event validated by @bilalghalib " + response['url']


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
    shortURLOut = bitlyShortener.shorten(longUrl=URLOut)
    for kindPerson in kindnessResponders['users']:
        messageOfKindness = '@' + kindPerson['screen_name']\
        + ' Something bad happened. Please respond with an act of kindness. Event validated by @' + tweetPerson + ' '  + shortURLOut['url']
        try:
            twitter.update_status(status=messageOfKindness)
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
        try:
            if t['in_reply_to_screen_name'] == 'weaware' and (
                t['text'][0:13]=="@weaware real"[0:13] or t['text'][0:13]=="@weaware true"[0:13] or t['text'][0:10]=="@weaware T"): 
                retweets.append(t)
                print 'Found a reply'
        except KeyError:
            print 'Not a retweet'
    for r in retweets:
        if ( long(r['retweeted_status']['id']) in alertedtweets ):
            print long(r['retweeted_status']['id'])
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
                sendVerifiedTweet(r['user']['screen_name'],r['retweeted_status']['id']) 
                for kindPerson in kindnessResponders['users']:
                    tweetUponAngels(r['user']['screen_name'],'https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id']))
                    print r['user']['screen_name']
                    print 'https://twitter.com/%s/status/%s/' % (r['user']['screen_name'], r['retweeted_status']['id'])
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


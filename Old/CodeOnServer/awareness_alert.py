#!/usr/bin/python
# -*- coding: utf-8 -*-
#july 25 2014 refactoring code

from twython import Twython
import random
import pickle
import datetime
from datetime import timedelta
from time import sleep
import MySQLdb as mdb
import urllib2
import loginInfo

#Follow a shortened URL.
def followURL(url):
    request = urllib2.Request(url)
    request.add_header('User-Agent',
                       'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0'
                       )
    opener = urllib2.build_opener()
    f = opener.open(request)
    return f.url

#What tweets have already been flagged as unverified?
def getUnverified(cur):
    alertids = list()
    numentries = \
        cur.execute('SELECT isValid, Tweetid FROM Alerts WHERE isValid=2;'
                    )
    for row in cur:
        print row[1]
        if row[1] not in alertids:
            alertids.append(row[1])
    return alertids

def getNumberVerifications(cur):
    #Find the number of verifications we currently have(?)
    urlcount = cur.execute('SELECT URL FROM Verifications;')
    urls = list()
    i = 0
    while i < urlcount:
        urls.append(cur.fetchone()[0])
        print 
        i += 1
    return urls

def searchTwitter(twitter, phrase):
    halfADayAgo = datetime.datetime.now() - timedelta(hours=12)
    halfADayAgo = halfADayAgo.strftime('%Y-%m-%d')
    #Search Twitter for "iraq car bomb"
    results = twitter.search(q=phrase, since=halfADayAgo,
                             count=200)
    return results

def getPeopleWhoCare():
    #Get the set of users who are volunteering as verifiers
    peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list'
            , owner_screen_name='weaware')
    return peopleWhoCare

def getOutOwnTweets(results, urls, twitter):
    ourtweets = twitter.get_user_timeline(screen_name='weaware', count=200)
    ourids = list()
    for t in ourtweets:
        ourids.append(t['id'])
    acceptable = list()
    for r in results['statuses']:
        if r['id'] not in ourids and len(r['entities']['urls']) != 0:
            try:
                if followURL(r['entities']['urls'][0]['expanded_url'])\
                     not in urls:
                    acceptable.append(r)
            except urllib2.HTTPError, e:
                print r['entities']['urls'][0]['expanded_url']
                print e
    return ourids, acceptable

def sendMessagesToList(acceptable, peopleWhoCare, unverifiedList, cur, twitter):
looper=0
if len(acceptable) != 0:
    for p in peopleWhoCare['users']:
        personToPing = looper % len(acceptable)
        rand = acceptable[personToPing]
        looper=looper+1 #This looper business takes the number of acceptable reported events and sends it to everyone, even if people get duplicates of other 
        print rand['entities']['urls'][0]['expanded_url']
        if rand['id'] not in unverifiedList:
            #print rand
            #print "Has not been classified as not real yet"
            outText=rand['text'].encode('utf-8')
            outText=outText.replace("'","`")
            print "('%s', '%s', %s, '%s','%s',%s);" % (rand['user']['screen_name'].encode('utf-8'), outText, rand['id'],
                followURL(rand['entities']['urls'][0]['expanded_url']).encode('latin-1', 'replace'),p['screen_name'].encode('utf-8'),'NULL')
            cur.execute("INSERT INTO Alerts (OPScreenName, TweetText, Tweetid, URL, ValidatorScreenName, isValid) VALUES ('%s', '%s', %s, '%s','%s','%s');"
            % (rand['user']['screen_name'].encode('utf-8'), outText,
            rand['retweeted_status']['id'], followURL(rand['entities']['urls'
            ][0]['expanded_url']).encode('utf-8'),p['screen_name'].encode('utf-8'),'NULL'))
            conn.commit()
            url = 'https://twitter.com/%s/status/%s/' % (rand['user'
                ]['screen_name'], rand['id'])
            message = '@' + p['screen_name'] + ' Please retweet if this is a valid event: ' + url
            print message
            twitter.update_status(status=message)
            print "probably a dupe"
        else:
            print "Classed as not real"
            print rand['id']

if __name__ == '__main__':
print "Welcome to Awareness Alerts where we send out potential car bombing evnents for a team of validators to confirm or deny:"
connectionToMySQL = loginInfo.connectToMySQL()
cursorForSQL = connectionToMySQL.cursor()
twitter = loginInfo.connectToTwitter()

cursorForSQL.execute('SELECT URL FROM Verifications;')
cur = cursorForSQL

getNumberVerifications(cursorForSQL)
potentialTweets = searchTwitter(twitter,"iraq car bomb")
urls = getNumberVerifications(cursorForSQL)
acceptable, ourids = getOutOwnTweets(potentialTweets, urls, twitter)
peopleWhoCare=getPeopleWhoCare()
unverifiedList = getUnverified(cursorForSQL)
sendMessagesToList(acceptable, peopleWhoCare, unverifiedList, cursorForSQL, twitter)


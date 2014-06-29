from twython import Twython
import random
import pickle
from time import sleep
import MySQLdb as mdb

#MySQL Time!
conn = mdb.connect('localhost', 'awareness', 'changeme', 'awareness')
cur = conn.cursor()


def getAlertedTweets():
	alertids = list()
	numentries = cur.execute("SELECT Tweetid FROM Alerts;")
	count = 0
	while count < numentries:
		alertids.append(cur.fetchone()[0])
		count += 1
	return alertids


#### This stuff connects us to twitter.com

APP_KEY = 'not'
APP_SECRET = 'for'
OAUTH_TOKEN = 'your'
OAUTH_TOKEN_SECRET = 'eyes'

twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

alertedtweets = getAlertedTweets()

for p in peopleWhoCare['users']:
	timeline = twitter.get_user_timeline(screen_name=p['screen_name'], count=200, exclude_replies=True)
	retweets = list()
	for t in timeline:
		try:
			if t['retweeted_status'] is not None:
                		retweets.append(t)
		except KeyError:
			print "Not a retweet"
	for r in retweets:
		if long(r['retweeted_status']['id']) in alertedtweets:
			try:
				cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID) VALUES ('%s', '%s', %s, '%s', %s);" % (r['retweeted_status']['user']['screen_name'], r['retweeted_status']['text'], r['retweeted_status']['id'], r['user']['screen_name'], r['id']))
				conn.commit()
			except mdb.Error, e:
				print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'

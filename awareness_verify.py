from twython import Twython
import random
import urllib2, httplib
import MySQLdb as mdb

#MySQL Time!
conn = mdb.connect('localhost', 'awareness', 'changeme', 'awareness')
cur = conn.cursor()

def followURL(url):
        request = urllib2.Request(url)
        request.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; rv:23.0) Gecko/20131011 Firefox/23.0')
        opener = urllib2.build_opener()
        f = opener.open(request)
        return f.url


def getAlertedTweets():
	alertids = list()
	numentries = cur.execute("SELECT Tweetid FROM Alerts;")
	count = 0
	while count < numentries:
		alertids.append(cur.fetchone()[0])
		count += 1
	return alertids


#### This stuff connects us to twitter.com

APP_KEY = ''
APP_SECRET = ''
OAUTH_TOKEN = ''
OAUTH_TOKEN_SECRET = ''


twitter = Twython(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)

peopleWhoCare = twitter.get_list_members(slug='iraq-car-bomb-admin-list',owner_screen_name='weaware')

alertedtweets = getAlertedTweets()

for p in peopleWhoCare['users']:
	timeline = twitter.get_user_timeline(screen_name=p['screen_name'], count=200, exclude_replies=True)
	retweets = list()
	for t in timeline:
		try:
			if t['retweeted_status'] is not None and len(t['retweeted_status']['entities']['urls']) != 0:
                		retweets.append(t)
		except KeyError:
			print "Not a retweet"
	for r in retweets:
		if long(r['retweeted_status']['id']) in alertedtweets:
			followURL(r['retweeted_status']['entities']['urls'][0]['expanded_url'])
			try:
				cur.execute("INSERT INTO Verifications (OPScreenname, TweetText, Tweetid, VerifierScreenName, VerifyingTweetID, URL) VALUES ('%s', '%s', %s, '%s', %s, '%s');" % (r['retweeted_status']['user']['screen_name'], r['retweeted_status']['text'], r['retweeted_status']['id'], r['user']['screen_name'], r['id'], followURL(r['retweeted_status']['entities']['urls'][0]['expanded_url'])))
				conn.commit()
			except mdb.Error, e:
				print 'Something went wrong. Probably a primary key violation, which is Okey dokey!'

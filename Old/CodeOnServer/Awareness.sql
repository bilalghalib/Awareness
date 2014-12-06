-- Run as privileged user.
-- Create our database, user and table of verified tweets
DROP DATABASE IF EXISTS awareness;
CREATE DATABASE awareness;
CREATE USER 'awareness'@'localhost' IDENTIFIED BY  'changeme';
GRANT ALL ON awareness.* TO 'awareness'@'localhost';

CREATE TABLE awareness.Verifications (OPScreenName varchar(100),  TweetText varchar(500), Tweetid bigint, URL varchar(1000), VerifierScreenName varchar(100), VerifyingTweetID bigint, PRIMARY KEY (Tweetid, VerifierScreenName));
CREATE TABLE awareness.Response (percentDamaged int, damageURL varchar(1000), positiveAction varchar(1000), timeAndDate datetime);
CREATE TABLE awareness.Alerts (OPScreenName varchar(100),  TweetText varchar(500), Tweetid bigint, URL varchar(1000), isPublished smallint, isValid smallint, PRIMARY KEY (Tweetid));

-- Run as privileged user.
-- Create our database, user and table of verified tweets

CREATE DATABASE awareness;
CREATE USER 'awareness'@'localhost' IDENTIFIED BY  'changeme';
GRANT ALL ON awareness.* TO 'awareness'@'localhost';

CREATE TABLE awareness.Verifications (OPScreenName varchar(100),  TweetText varchar(500), Tweetid bigint, URL varchar(1000), VerifierScreenName varchar(100), VerifyingTweetID bigint, PRIMARY KEY (Tweetid, VerifierScreenName));

CREATE TABLE awareness.Alerts (OPScreenName varchar(100),  TweetText varchar(500), Tweetid bigint, PRIMARY KEY (Tweetid));

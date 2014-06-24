-- Run as privileged user.
-- Create our database, user and table of verified tweets

CREATE DATABASE awareness;
CREATE USER 'awareness'@'localhost' IDENTIFIED BY  'changeme';
GRANT ALL ON awareness.* TO 'awareness'@'localhost';

CREATE TABLE awareness.TweetsVerified (Userid int,  TweetText varchar(500), Tweetid bigint, URL varchar(1000));

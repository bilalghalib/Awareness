#!/bin/bash
echo 'hello world';

debconf-set-selections <<< 'mysql-server mysql-server/root_password password changeme'
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password changeme'

apt-get update
apt-get install -y python-pip python-dev screen mysql-server libmysqlclient-dev;
pip install -r /vagrant/requirements.txt;
mysql --password=changeme < /vagrant/Awareness.sql
#!/bin/sh
#Update OS
sudo apt-get update
sudo apt-get upgrade -y
sleep 30
#install nginx
sudo apt-get install nginx -y
sleep 15
#Install node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sleep 15
whereis node
echo "npm version is $(npm --version)"
#Install MySQL
sleep 15
sudo apt-get install mysql-server -y
echo "Give mysql server time to start up before we try to set a password..."
sleep 5
sudo mysql -uroot -e <<EOSQL "drop user root@localhost;CREATE USER 'root'@'localhost' IDENTIFIED BY '123456';GRANT ALL PRIVILEGES ON * . * TO 'root'@'localhost';FLUSH PRIVILEGES; create database if not exists webapp"
EOSQL
echo "Done setting mysql password."
#Update permission and file ownership on the copied application artifacts
sleep 5
echo "Installing unzip"
sudo apt-get install unzip
#Unzip file
sleep 5
unzip /home/ubuntu/webapp.zip -d /home/ubuntu/webapp
sudo rm -rf /home/ubuntu/webapp.zip
# Install the node server
sleep 5
cd /home/ubuntu/webapp
sudo npm install
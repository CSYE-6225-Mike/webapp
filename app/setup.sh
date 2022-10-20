#!/bin/sh
sleep 30

# Update OS
sudo apt-get update
sudo apt-get upgrade -y

# Install node.js
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get -y install nodejs

# Install MySQL
export DEBIAN_FRONTEND=noninteractive
sudo apt-get -q -y install mysql-server
echo "Give mysql server time to start up before we try to set a password..."
sleep 5
sudo mysql -uroot -e <<EOSQL "drop user root@localhost;CREATE USER 'root'@'localhost' IDENTIFIED BY 'L13688623086i';GRANT ALL PRIVILEGES ON * . * TO 'root'@'localhost';FLUSH PRIVILEGES;"
EOSQL
echo "Done setting mysql password."

# # Update permission and file ownership on the copied application artifacts
# sudo mkdir ~/app
# cd ~/app
# sudo git clone https://github.com/AndroidDevelopment-Mike/app.git
# cd app
# npm install
# npm start





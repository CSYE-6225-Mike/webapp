CREATE USER 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON * . * TO 'root'@'localhost';
FLUSH PRIVILEGES;
CREATE DATABASE webapp;

use mysql;
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL ON *.* TO 'username'@'localhost';
flush privileges;

UPDATE mysql.user SET Password=PASSWORD('') WHERE User='root'; 
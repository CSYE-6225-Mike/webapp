# webapp
Demo Instructions:
- npm install
- npm start
- Test the Rest API on postman with localhost:3000/healthz
- Test the Rest API on postman with localhost:3000/v1/account to create user1[password], user2[password], user3[password]
- Test the Rest API on postman with localhost:3000/v1/account/:id to get user info with authenticated account
- Test the Rest API on postman with localhost:3000/v1/account/:id to update user info with authenticated account

Assignment 4 Demo:
Demo by launching an AMI in dev account.
- Create another user role in AMI since we can't use administrator access for packer
- packer validate ami.pkr.hcl
- packer build ami.pkr.hcl

Assignment 5 Demo:
- Already delete the MySQL server in the setup.sh. If we build the AMI, the MySQL server will not be installed.
- Build AMI -> copy ami id -> edit cloudformation ami_id -> run cloudformation on demo account -> test API on Postman 

Assignment 7 Demo:
- Demonstrate the setup.sh script and build the AMI -> paste the AMI id to cloudformation -> create the cloudformation in demo account -> check the cloudwatch dashboard 

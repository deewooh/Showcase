Welcome to the TaskFlow Site by:

Rudra Saha 	z5161081
Deepan Kumar	z5210009
Ke Zhao 	z5205203
Minsung Choe	z5207863
David Wu 	z5209802


System Prerequisites:
- Lubuntu 20.4.1 LTS on VirtualBox 6.1.18 already installed with root-user access
- TaskFlow source (the 'source' directory)


Installation steps:


1. Installing dependencies:
In a new terminal window navigate to the Task-flow source code directory such that
$ ls 
> Requirements.txt, package.json, task_master_site ... 

2. Download Python to enable pip3 dependencies:
Enable root mode if you have not
$ sudo su

(Root)$ apt install python3-pip

#After if you have installed Python successfully:

(Root)$ python3 -V
> Python 3.8.10


3. Download nodeJS and NPM:

Download NodeJS and NPM
(Root)$ sudo apt install nodejs
(Root)$ sudo apt-get install npm


4. Download and install the Python backend framework:
(Root)$ pip3 install virtualenv
(Root)$ python3 -m virtualenv venv

You should now have a folder called ‘venv’
(Root)$ ls
> … venv ….

Enable your virtual environment
(Root)$ source venv/bin/activate

If successful your command-line should now state (venv)
Install the Python libraries such as Django, this may take a while
(venv)(Root)$ pip3 install -r requirements.txt


5. Download and install the NodeJS frontend framework and libraries:
This will download all the JS dependencies in the package.json, this may also take a while
(venv)(Root)$ npm install

If successful your source folder should now contain a ‘node_modules’
(venv)(Root)$ ls
> … node_modules …


Compile the source code for the front-end, this may take a few seconds
Terminal will tell you when it has compiled successfully
(venv)(Root)$ npm run build
….
> webpack 5.46.0 compiled successfully in 5000 ms


6. Initialise the backend:
(venv)(Root)$ cd task_master_site

This step is crucial as it creates the database for the site:
$ python manage.py migrate
** Please note running this command in root-user mode you will mean you ALWAYS have to run the server in root-user mode as the Database is created with ‘write’ only access for Root.**

7. Start the site and server:
(venv)(root)$ manage.py runserver
….
> Starting development server at http://127.0.0.1:8000/
> Quit the server with CONTROL-C

The site is now ready to go! The home page is just located on http://127.0.0.1:8000/taskflow/ 

Please refer to the UserManual for a detailed guide of how to use all of TaskFlow's functionalities 


(Option) Creating an admin account
This step is completely optional as TaskFlow is a completely autonomous app and does not require any administrators to perform any explicit work. 
First make sure you are on the directory with the 'manage.py' file, then:

$ python manage.py createsuperuser

Follow the prompts to register an admin account. This will give you access to 
http://127.0.0.1:8000/admin, which allows you to see all Users, Tasks and Connections in the database.
Warning: In production (the real world) this could be used for testing, or removing any offensive accounts. In production only the most trusted administrators should have a ‘superuser’ account as it provides access to all User’s private information (email and the hash of User’s passwords).



 






# teaganlamp.com

Minimal Web app to interact with teagan's desk lamp. 

### **TODO:** 

- Clicks per minute / second and cool graphic
- Green circle next to leaderboard username for currently active users
- load leaderboard only on scroll to the bottom of the page
- MAYBE:
  - optimize leaderboard
  - button to display stats
    - time spent on / time spent off 
    - highest recorded click speed and user
    - funniest name: teagan_poopoo
  - poo poo pee pee


### Local Setup

```Bash 
git clone https://github.com/tybens/teaganlamp.com
cd teaganlamp.com

# virtual environment setup
python3 -m venv venv
sourve venv/bin/activate
pip3 install -r requirements.txt
```

start server with `gunicorn -b localhost:5000 --worker-class eventlet -w 1 app:app`

start redis with `$REDISBIN/src/redis-server` after redis is installed and setup

start client with `live-server` in the static folder


### Deploying

```Bash
cd /srv # wherever we want the app to be
sudo git clone https://github.com/tybens/teaganlamp.com.git
cd teaganlamp.com
sudo apt-get update
sudo apt install python3-pip python3-dev python3-venv
python3 -m venv venv
source venv/bin/activate
sudo pip3 install -r requirements.txt

# static files setup
sudo mkdir /var/www/teaganlamp.com
sudo chmod 755 /var/www/teaganlamp.com
sudo ln -s /srv/teaganlamp.com/static /var/www/teaganlamp.com/html

# nginx config
sudo mv etc/nginx-teaganlamp /etc/nginx/sites-available/nginx-teaganlamp
sudo ln -s /etc/nginx/sites-available/nginx-teaganlamp /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo ufw allow 'Nginx Full'  # not sure if this is necessary (the article said it was)

# redis setup 
sudo wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
sudo make install

# supervisor setup
mkdir /var/log/teaganlamp.com  # where the errors are logged
sudo mv etc/supervisor_services.conf /etc/supervisord.conf
sudo supervisord -c /etc/supervisord.conf  # starts supervisord services
	# to restart just the gunicorn: supervisorctl restart gunicorn

# set up certbot (for https:// ssl verification)
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

### Updating deployment (after deployed)
```Bash
cd /srv/teaganlamp.com
sudo git pull

# if gunicorn app needs to be restarted:
sudo supervisorctl restart gunicorn

# if nginx needs to be reloaded:
sudo systemctl reload nginx

# if redis needs to be restarted [PROBABLY NOT]:
sudo supervisorctl restart redis

# useful commands
sudo supervisorctl status
sudo systemctl status nginx
# error and access log directories :
/var/log/nginx
/var/log/teaganlamp.com # gunicorn and redis
/srv/teaganlamp.com/supervisord.log # supervisord

```


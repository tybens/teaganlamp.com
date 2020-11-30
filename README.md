# teaganlamp.com

Basic flask app to interact with teagan lamp.

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
sudo mkdir /var/www/static
sudo mv -v static/* /var/www/static/
sudo chown 755 /var/www/static

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

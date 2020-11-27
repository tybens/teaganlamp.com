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

optionally start another client with `live-server` (to see the button change for all connected clients upon any click)

### Deploying

```Bash
cd /srv # wherever we want the app to be
git clone https://github.com/tybens/teaganlamp.com.git
cd teaganlamp.com
sudo apt-get update
sudo apt install -U python3-pip python3-dev python3-venv
python3 -m venv venv
source venv/bin/activate
sudo pip3 install -r requirements.txt

# static files
sudo mkdir /var/www/static
sudo mv -v index.html /var/www/static/
sudo chown 755 /var/www/static

# nginx config
sudo mv nginx-teaganlamp /etc/nginx/sites-available/nginx-teaganlamp
sudo ln -s /etc/nginx/sites-available/nginx-teaganlamp /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo ufw allow 'Nginx Full'  # not sure if this is necessary (the article said it was)

# systemctl setup
sudo mv gunicorn.service /etc/systemd/system/gunicorn.service
sudo systemctl start gunicorn  # to start the gunicorn
sudo systemctl enable gunicorn # to enable gunicorn to start on system startup

# set up certbot (for https:// ssl verification)
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

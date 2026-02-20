#!/bin/bash
git pull origin master
npm install
npm run build
sudo rm -rf /var/www/app/frontend/dev/*
sudo cp -r dist/* /var/www/app/frontend/dev/
sudo chown -R www-data:www-data /var/www/app/frontend/dev
echo "✅ Deployment Sukses!"


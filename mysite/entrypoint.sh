#!/bin/bash

python manage.py migrate
echo "Migrated database"
python manage.py createsuperuser
echo "Created superuser"
echo "Starting Django server"
python -R manage.py runserver 0.0.0.0:8000
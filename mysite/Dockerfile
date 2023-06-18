# syntax=docker/dockerfile:1
FROM python:3.9-slim-bullseye
WORKDIR /code
# RUN apt-get gcc musl-dev linux-headers libffi-dev
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .
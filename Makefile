#/usr/bin/sh
# Build Mafia Signs 3D avatar gesture dictionary

default: all
# Clean build files
clean:
	rm -rf pages

#create all files
all:
# Publish to github
publish:
	git push origin master

server:
	poetry run python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload

test:
	poetry run python -m pytest

build:
	poetry run python build.py

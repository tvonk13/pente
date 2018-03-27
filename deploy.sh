#!/bin/bash

export PORT=5102
export MIX_ENV=prod
export GIT_PATH=/home/pente/src/pente 

PWD=`pwd`
if [ $PWD != $GIT_PATH ]; then
	echo "Error: Must check out git repo to $GIT_PATH"
	echo "  Current directory is $PWD"
	exit 1
fi

if [ $USER != "pente" ]; then
	echo "Error: must run as user 'pente'"
	echo "  Current user is $USER"
	exit 2
fi

mix deps.get
(cd assets && npm install)
(cd assets && ./node_modules/brunch/bin/brunch b -p)
mix phx.digest
mix release --env=prod

mkdir -p ~/www
mkdir -p ~/old

NOW=`date +%s`
if [ -d ~/www/pente ]; then
	echo mv ~/www/pente ~/old/$NOW
	mv ~/www/pente ~/old/$NOW
fi

mkdir -p ~/www/pente
REL_TAR=~/src/pente/_build/prod/rel/memory/releases/0.0.1/memory.tar.gz
(cd ~/www/pente && tar xzvf $REL_TAR)

crontab - <<CRONTAB
@reboot bash /home/pente/src/pente/start.sh
CRONTAB

#. start.sh

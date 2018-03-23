#!/bin/bash

export PORT=5102

cd ~/www/pente
./bin/pente stop || true
./bin/pente start

#!/bin/bash
cd /workspace
pm2 start ecosystem.config.js
pm2 save
pm2 startup

#!name=blued
#!desc=blued
#!icon=https://github.com/Toperlock/Quantumult/raw/main/icon/Doraemon/Doraemon-1023.png

[Script]
http-response ^https:\/\/social\.blued\.cn\/users\/.*\/setting script-path=https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js, requires-body=true, timeout=60, tag=blued

http-response ^https:\/\/social\.blued\.cn\/users\/shadow script-path=https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js, requires-body=true, timeout=60, tag=blued

http-response ^https:\/\/social\.blued\.cn\/users\/.*\/basi script-path=https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js, requires-body=true, timeout=60, tag=blued

[MITM]
hostname = *.blued.*

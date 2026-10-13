#!/bin/sh
# luci-app-samba-gui 一键安装脚本
# 前提：已安装 luci-app-samba4 和 samba4-server
set -e

TS=$(date +%Y%m%d_%H%M%S)
BASE="https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main"

echo "==> 备份原文件（后缀 .bak_$TS）"
cp /www/luci-static/resources/view/samba4.js /www/luci-static/resources/view/samba4.js.bak_$TS 2>/dev/null || true
cp /usr/share/rpcd/acl.d/luci-app-samba4.json /usr/share/rpcd/acl.d/luci-app-samba4.json.bak_$TS 2>/dev/null || true

echo "==> 下载并安装界面文件"
wget -qO /www/luci-static/resources/view/samba4.js "$BASE/files/samba4.js"
wget -qO /usr/share/rpcd/acl.d/luci-app-samba4.json "$BASE/files/acl.json"
wget -qO /usr/libexec/smb-usermgr.sh "$BASE/files/smb-usermgr.sh"
chmod 755 /usr/libexec/smb-usermgr.sh

echo "==> 清理 LuCI 缓存并重启服务"
rm -f /www/luci-static/resources/view/samba4.js.o /tmp/luci-indexcache* 2>/dev/null || true
/etc/init.d/rpcd restart 2>/dev/null || true
/etc/init.d/samba4 restart 2>/dev/null || true

echo ""
echo "✔ 安装完成！浏览器 Ctrl+F5 强制刷新 LuCI，进入「NAS → 网络共享」使用。"
echo "  恢复原版：用 /www/luci-static/resources/view/ 下的 .bak_$TS 备份覆盖回去即可。"

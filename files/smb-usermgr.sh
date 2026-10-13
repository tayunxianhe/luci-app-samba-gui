#!/bin/sh
# Samba 共享用户管理/自动共享辅助脚本（由 LuCI samba4 界面调用）
# 用法: smb-usermgr.sh list | add <user> <pass> | chpass <user> <pass> | del <user>
#       smb-usermgr.sh autoscan | autoclean
# 注: 本机 rpcd 的 file exec 不支持 env 参数，密码只能经命令行参数传入

check_name() {
	case "$1" in
		""|*[!A-Za-z0-9._-]*|.*|*-*) echo "用户名不合法" >&2; exit 2 ;;
	esac
}

do_add() {
	local u="$1"
	check_name "$u"
	# 系统用户不存在则创建（无主目录、禁止登录）
	if ! grep -q "^$u:" /etc/passwd; then
		err=$(/usr/sbin/useradd -M -s /bin/false "$u" 2>&1)
		if ! grep -q "^$u:" /etc/passwd; then
			echo "${err:-创建系统用户失败（用户名可能已被系统占用或格式不符）}" >&2
			exit 3
		fi
	fi
	out=$(printf '%s\n%s\n' "$2" "$2" | /usr/bin/smbpasswd -a -s "$u" 2>&1)
	if [ $? -ne 0 ]; then
		# 系统用户是刚建的，回滚避免残留
		sed -i "/^$u:/d" /etc/passwd /etc/group /etc/shadow 2>/dev/null
		echo "${out:-添加 Samba 用户失败}" >&2
		exit 4
	fi
}

do_chpass() {
	check_name "$1"
	out=$(printf '%s\n%s\n' "$2" "$2" | /usr/bin/smbpasswd -s "$1" 2>&1)
	if [ $? -ne 0 ]; then
		echo "${out:-修改密码失败（密码可能过短，至少5位）}" >&2
		exit 4
	fi
}

do_del() {
	check_name "$1"
	/usr/bin/smbpasswd -x "$1" >/dev/null 2>&1
	sed -i "/^$1:/d" /etc/passwd /etc/group /etc/shadow 2>/dev/null
}

# 立即扫描当前已挂载的存储设备，为没有共享覆盖的挂载点生成自动共享
# （hotplug 只在插拔瞬间触发，这里补上"事后扫描"）
do_autoscan() {
	local as
	as=$(uci -q get samba4.@samba[0].autoshare)
	[ "$as" = "0" ] || [ "$as" = "no" ] && return

	# 已有共享覆盖的路径集合
	local exist
	exist=$(uci -X show samba4 2>/dev/null | sed -n "s/.*\.path='\(.*\)'.*/\1/p")

	local dev base target name covered p
	grep -v '/boot\|/opt' /proc/mounts | while read -r j; do
		dev=${j%% *}
		# 只自动共享外置存储；mmcblk 是焊死的内置存储，不共享（防止误删系统文件）
		case "$dev" in
			/dev/sd*|/dev/md*|/dev/hd*|/dev/nvme*) ;;
			*) continue ;;
		esac
		base=$(basename "$dev")
		target=$(echo "$j" | cut -d' ' -f2 | sed 's/\\040/ /g')
		[ -n "$target" ] || continue

		# 与 hotplug 相同的覆盖判断：任一已有共享路径与挂载点相同或互为父子
		covered=0
		for p in $exist; do
			case "$target" in
				"$p"|"$p"/*) covered=1 ;;
			esac
			case "$p" in
				"$target"|"$target"/*) covered=1 ;;
			esac
			[ "$covered" = "1" ] && break
		done
		[ "$covered" = "1" ] && continue

		name=${target#/mnt/}
		name=$(echo "$name" | sed -e 's/^\///' -e 's/\//_/g')
		[ -n "$name" ] || name=$base

		local sid
		sid=$(uci add samba4 sambashare)
		uci set samba4.$sid.auto='1'
		uci set samba4.$sid.name="$name"
		uci set samba4.$sid.path="$target"
		uci set samba4.$sid.read_only='no'
		uci set samba4.$sid.guest_ok='yes'
		uci set samba4.$sid.create_mask='0666'
		uci set samba4.$sid.dir_mask='0777'
		uci set samba4.$sid.device="$base"
		uci set samba4.$sid.force_root='1'
		uci commit samba4
		echo "ADDED $name"
	done
}

# 删除所有自动生成的共享（关闭自动共享时调用）
do_autoclean() {
	local s
	for s in $(uci show samba4 2>/dev/null | grep '=sambashare' | sed 's/^samba4\.//;s/=.*//'); do
		if [ "$(uci -q get samba4.$s.auto)" = "1" ]; then
			uci delete samba4.$s
		fi
	done
	uci commit samba4
}

case "$1" in
	list)
		/usr/bin/pdbedit -L 2>/dev/null | cut -d: -f1
		;;
	add)
		[ -n "$2" ] && [ -n "$3" ] || { echo "缺少用户名或密码" >&2; exit 2; }
		do_add "$2" "$3"
		;;
	chpass)
		[ -n "$2" ] && [ -n "$3" ] || { echo "缺少用户名或密码" >&2; exit 2; }
		do_chpass "$2" "$3"
		;;
	del)
		[ -n "$2" ] || { echo "缺少用户名" >&2; exit 2; }
		do_del "$2"
		;;
	autoscan)
		do_autoscan
		;;
	autoclean)
		do_autoclean
		;;
	*)
		echo "usage: $0 list|add|chpass|del|autoscan|autoclean ..." >&2
		exit 1
		;;
esac
echo OK

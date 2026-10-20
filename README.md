# 图形化配置的 Samba (luci-app-samba-gui)

**简体中文** | [English](#english)

一个为 OpenWrt LuCI 打造的 **Samba 可视化配置界面**，专为新手和不熟悉 Samba 配置的用户设计。不用再手写共享路径、权限掩码（create mask / dir mask）这些令人头大的参数——像 Windows 共享文件夹一样**点选、勾选**就能完成全部配置。

> 适用环境：OpenWrt 21.02+（新版 JS 版 LuCI），已在 **Kwrt 25.12 (IPQ60xx)** 上完整测试
> 依赖：`luci-app-samba4` + `samba4-server`

---

## ✨ 功能特性

| 功能 | 说明 |
|---|---|
| 🖱️ 图形化共享管理 | 卡片式共享列表，一目了然；编辑/删除一键操作 |
| 📂 可视化目录选择 | 弹窗式文件浏览器，自动区分**外置存储（U盘/移动硬盘）**与**内置存储**；支持在当前位置**新建文件夹** |
| 🔘 权限点选式配置 | 访问权限（读写/只读/隐藏）、访问方式（匿名/账号密码/仅游客）全部点选，无需懂掩码 |
| 🔗 权限智能联动 | 选「只读」自动锁定写权限掩码；选「匿名」自动锁定用户列表——杜绝无效/矛盾配置 |
| 👤 内置用户管理 | 页面上直接添加/删除 Samba 用户、修改密码，每个输入框都有规则说明，失败时给出具体原因 |
| 💾 自动共享增强 | 开启后**立即扫描**已挂载的U盘并生成共享（原版只在插拔瞬间触发）；只共享外置硬盘，**内置存储不自动共享**，防止误删系统文件 |
| ⚙️ 完整通用设置 | 保留原版全部选项：监听接口、性能调优、同步 I/O、macOS 兼容、SMBv1 旧协议兼容（老电视/老设备）、Netbios/AD DC/Winbind 开关、smb.conf 模板在线编辑 |
| 🖥️ Windows 11 网络发现 | 内置 wsdd2 检测/一键启用，修复 Win11 24H2 起「网络」面板看不到路由器的问题 |
| 🎨 全新视觉风格 |靛蓝色卡片式设计，响应式布局，小屏/低分辨率自动出横向滚动条 |

## 📸 截图预览

**Windows 网络发现（wsdd2 检测）**

![网络发现](screenshots/wsdd_discovery.png)

**通用设置（含原版全部选项 + 配置模板编辑）**

![通用设置](screenshots/full_settings.png)

**共享目录列表（自动共享带标记）**

![共享列表](screenshots/autoscan_list.png)

**添加共享弹窗（权限联动锁定）**

![添加共享](screenshots/link_auth.png)

**可视化目录选择 + 新建文件夹**

![目录选择](screenshots/mkdir_footer.png)

**内置用户管理**

![用户管理](screenshots/user_added.png)

## 🚀 一键安装

SSH 登录路由器后执行（需已安装 `luci-app-samba4` 和 `samba4-server`）：

```sh
wget -qO /tmp/install.sh https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main/install.sh && sh /tmp/install.sh
```

安装完成后浏览器 **Ctrl+F5** 强制刷新 LuCI，进入「NAS → 网络共享」即可使用。

<details>
<summary>手动安装方式</summary>

```sh
# 1. 备份
cp /www/luci-static/resources/view/samba4.js /www/luci-static/resources/view/samba4.js.bak
cp /usr/share/rpcd/acl.d/luci-app-samba4.json /usr/share/rpcd/acl.d/luci-app-samba4.json.bak

# 2. 下载并替换（地址改为 raw.githubusercontent.com 下的实际文件）
wget -qO /www/luci-static/resources/view/samba4.js https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main/files/samba4.js
wget -qO /usr/share/rpcd/acl.d/luci-app-samba4.json https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main/files/acl.json
wget -qO /usr/libexec/smb-usermgr.sh https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main/files/smb-usermgr.sh
chmod 755 /usr/libexec/smb-usermgr.sh

# 3. 清缓存并重启
rm -f /www/luci-static/resources/view/samba4.js.o /tmp/luci-indexcache*
/etc/init.d/rpcd restart
/etc/init.d/samba4 restart
```

</details>

## 📦 文件说明

| 文件 | 作用 |
|---|---|
| `files/samba4.js` | LuCI 界面视图（核心） |
| `files/smb-usermgr.sh` | 后端辅助脚本：用户管理（useradd/smbpasswd/pdbedit）+ 自动共享扫描/清理 |
| `files/acl.json` | rpcd ACL，为界面授权 mkdir / 用户管理脚本 / wsdd2 启停 |
| `install.sh` | 一键安装脚本（自动备份原文件、自动安装启用 wsdd2） |

## 🔙 恢复原版

安装脚本会自动备份，按备份时间戳还原即可：

```sh
cp /www/luci-static/resources/view/samba4.js.bak_时间戳 /www/luci-static/resources/view/samba4.js
cp /usr/share/rpcd/acl.d/luci-app-samba4.json.bak_时间戳 /usr/share/rpcd/acl.d/luci-app-samba4.json
/etc/init.d/rpcd restart
```

## ❓ 常见问题

- **添加用户失败？** 用户名必须以字母开头（Linux 系统用户限制），2~24 位；密码至少 5 位。失败时会显示具体原因。
- **为什么选「需要账号密码」后别人访问不了？** 请先在「共享用户」中创建账号，那才是共享登录用的账号（与路由器管理密码无关）。系统默认禁止 root 访问共享。
- **开启自动共享后列表是空的？** 新版本保存时会立即扫描已挂载的存储并生成共享；如果是从旧版本升级，重新保存一次通用设置即可。
- **内置存储会被共享出去吗？** 不会。自动共享只针对外置设备，防止误删路由器系统文件。
- **Windows「网络」里看不到路由器？** Win11 24H2 起不再用 NetBIOS 广播发现，改用 WSD 协议。本插件已内置 `wsdd2` 检测与一键启用（通用设置 → Windows 网络发现）。安装脚本也会自动安装并设为开机自启。临时可用 `\\路由器IP` 直接访问，功能完全一样。

## 🖥️ 关于 Windows 11 看不到路由器的原因

Win10 及以前系统靠 **NetBIOS 广播**（UDP 137/138）在「网络」列表里显示设备；**Windows 11 24H2 起微软改用 WSD 协议**，老机制失效——所以能 `\\10.0.0.1` 访问共享，却在网络列表里看不到路由器。这不是 Samba 出故障。

本插件的处理：
1. `install.sh` 自动 `opkg install wsdd2` 并 `enable`，开机自动运行；
2. 顺带修复 `smb.conf.template` 中 `netbios name = |NAME|` 后面多出的一个**尾随空格**（会导致 NetBIOS 名异常）；
3. 界面「通用设置 → Windows 网络发现」可随时检测状态并一键启用。

若装好后仍看不到：重启一次电脑；确认 Windows 防火墙的「网络发现」已开启；或直接在资源管理器地址栏输入 `\\10.0.0.1`。

## ⚠️ 安全说明

- 本插件会修改 rpcd ACL（`/usr/share/rpcd/acl.d/luci-app-samba4.json`），为界面授权 `mkdir` 和用户管理脚本，安装前请知悉。
- 开启「匿名访问」意味着局域网内任何设备都可读写该共享，请仅在家用网络使用。

---

<a id="english"></a>
# English

**luci-app-samba-gui** is a visual configuration interface for Samba on OpenWrt LuCI, designed for beginners who are not familiar with Samba configuration. No more manually typing share paths or permission masks — configure everything by **clicking and selecting**, just like sharing a folder on Windows.

## Features

- **Card-based share management** — view, edit and delete shares at a glance
- **Visual directory picker** — browse with a dialog that distinguishes external (USB/HDD) and internal storage; create folders on the fly
- **Point-and-click permissions** — access level (read-write / read-only / hidden) and access mode (anonymous / password / guest-only) as radio options
- **Smart permission linkage** — read-only shares lock the write masks; anonymous/guest mode locks the user list, preventing invalid configurations
- **Built-in user management** — add/remove Samba users and change passwords on the page, with clear validation messages
- **Enhanced auto-share** — immediately scans mounted USB/HDD drives on save (the stock hotplug script only fires on plug events); internal storage is **never** auto-shared for safety
- **Full original settings restored** — interfaces, extra tuning, sync I/O, macOS compatibility, legacy SMBv1 protocol, Netbios/AD DC/Winbind toggles, and online smb.conf template editing
- **Windows 11 network discovery** — built-in wsdd2 detection and one-click enable, fixing the issue where the router is invisible in Explorer's *Network* pane on Win11 24H2+
- **Modern responsive UI** — indigo card design with horizontal scrolling on narrow screens

## Why can't I see the router in Windows Explorer → Network?

Windows 10 and earlier used **NetBIOS broadcasts** (UDP 137/138) to populate the Network pane. **Windows 11 24H2+ switched to WSD**, which breaks that mechanism — so `\\10.0.0.1` works fine while the router stays invisible in the list. This is not a Samba malfunction.

What this plugin does:
1. `install.sh` runs `opkg install wsdd2` and enables it at boot;
2. Fixes a stray **trailing space** after `netbios name = |NAME|` in `smb.conf.template` that corrupted the NetBIOS name;
3. Adds a *General Settings → Windows Discovery* card to check status and enable it on demand.

If the router still doesn't show up: reboot your PC once, make sure Windows Firewall's *Network Discovery* is on, or just type `\\10.0.0.1` in Explorer — same thing.

## Requirements

- OpenWrt 21.02+ with client-side rendered LuCI (tested on Kwrt 25.12, IPQ60xx)
- `luci-app-samba4` and `samba4-server` installed

## Install (one line)

```sh
wget -qO /tmp/install.sh https://raw.githubusercontent.com/tayunxianhe/luci-app-samba-gui/main/install.sh && sh /tmp/install.sh
```

Then hard-refresh LuCI (**Ctrl+F5**) and open *NAS → Network Shares*.

## Security notice

The installer modifies the rpcd ACL to grant `mkdir` and the user-management helper script to the web UI. Anonymous access means every device on your LAN can read/write the share — use on home networks only.

## License

MIT
